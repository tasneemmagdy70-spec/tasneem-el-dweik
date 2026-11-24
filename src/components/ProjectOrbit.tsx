"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { uiSound } from "@/lib/uiSound";
import { animate, motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";
import { FEATURED as PROJECTS } from "@/lib/projects";
import ProjectCover from "./ProjectCover";
import { ArrowUpRight } from "./icons";
import { BTN_PRIMARY, BTN_PRIMARY_ICON } from "@/lib/ui";

/**
 * THE CORE — the work, in orbit.
 *
 * One fixed stage: the project you're on always sits in the same place — dead
 * centre, over the nucleus — with its caption always in the same place under
 * it. The eye never has to go looking. Everything else is an electron: small,
 * quiet, drifting on the atom's tilted shells, passing *behind* the project in
 * focus. Turning sideways (a swipe, the ‹ › arrows beside the card, ←/→) swaps
 * who takes the stage; one shrinks back into orbit while the next rises into the
 * centre. The scroll never turns projects — down always means the next layer.
 */

const GOLDEN = 137.5 * (Math.PI / 180);
const COVER = 632 / 808; // Behance cover ratio
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where the stage is. Shared with the Hero so the atom sits exactly behind it. */
export function coreStage(vw: number, vh: number, mobile: boolean) {
  // tablet (portrait, 640–1023px): the phone's single-column stage, scaled up to the screen
  const tablet = mobile && vw >= 640;
  const CAPH = tablet ? 186 : mobile ? 152 : 156; // gap + caption block under the card (phone: measured 129 + gap + air)
  const top = tablet ? 250 : mobile ? 205 : 96; // below the title (mobile) / the header (desktop)
  const bottom = vh - (tablet ? 104 : mobile ? 84 : 76); // above the counter + "More work"
  // on short phones the card gives way first, so the caption never runs into the bottom bar
  const CW = tablet
    ? Math.min(vw * 0.72, (vh * 0.46) / COVER, 600)
    : mobile
      ? Math.max(170, Math.min(vw * 0.74, 300, (bottom - top - CAPH - 8) / COVER))
      : Math.min(380, vw * 0.28, (vh * 0.42) / COVER);
  const CH = CW * COVER;
  let fy: number;
  if (mobile) {
    fy = top + Math.max(0, (bottom - top - CH - CAPH) / 2) + CH / 2;
  } else {
    fy = vh * 0.44;
    // never slide under the title on narrower desktops
    const titleR = Math.max(32, (vw - 1152) / 2 + 32) + 470;
    const titleB = vh * 0.13 + 124;
    if (vw / 2 - CW / 2 < titleR) fy = Math.max(fy, titleB + 16 + CH / 2);
  }
  fy = Math.min(fy, bottom - CAPH - CH / 2);
  return { CW, CH, CAPH, fx: vw / 2, fy, top, bottom, tablet };
}

type Props = {
  index: number; // the project on stage
  onIndex: (i: number) => void;
  drag: MotionValue<number>; // a finger's sideways travel in px while it's on the work (NaN = none)
  show: MotionValue<number>; // 0 → 1 as the layer arrives
  enabled: boolean;
  mobile: boolean;
  vw: number;
  vh: number;
  onAll: () => void;
};

const HINT_KEY = "ed-orbit-hint";

export default function ProjectOrbit({ index, onIndex, drag, show, enabled, mobile, vw, vh, onAll }: Props) {
  const reduce = useReducedMotion();
  const N = PROJECTS.length;
  const stage = coreStage(vw, vh, mobile);
  const { top, bottom, tablet } = stage;
  let fx = stage.fx;
  let { CW, CH, CAPH, fy } = stage;
  const REST = tablet ? 0.28 : mobile ? 0.34 : 0.36; // an electron's size relative to the stage card
  const left = tablet ? 40 : mobile ? 24 : Math.max(32, (vw - 1152) / 2 + 32);

  // Phones & tablets: one measured stack — title · card (cover + folder front) · controls — with
  // the same rhythm on every screen: a fixed breath under the title, a fixed gap to the controls,
  // and the card as large as what's left allows (never so large that anything touches).
  const titleBox = useRef<HTMLDivElement>(null);
  const [titleBottom, setTitleBottom] = useState(0);
  const [titleRight, setTitleRight] = useState(0);
  useLayoutEffect(() => {
    const el = titleBox.current;
    if (!el) return;
    const measure = () => {
      setTitleBottom(el.offsetTop + el.offsetHeight);
      setTitleRight(el.offsetLeft + el.offsetWidth);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);
  const TAB = mobile && !tablet ? 26 : 30; // the folder's tab (above the folder, holding the number)
  const PAD = mobile && !tablet ? 8 : 10; // the folder's edge around the cover
  const PH = tablet ? 192 : mobile ? 152 : 176; // the folder's lower part: type, name, line, the action
  const GAP_TOP = tablet ? 40 : mobile ? 30 : 28; // title → card
  const GAP_ROW = tablet ? 28 : 22; // card → controls
  const ROW = 48; // the controls row
  let rowTop = 0;
  if (mobile) {
    const tb = titleBottom || (tablet ? 240 : 190);
    const avail = vh - (tablet ? 32 : 18) - tb - GAP_TOP; // card + gap + controls must fit here
    const fixed = TAB + PAD + PH + GAP_ROW + ROW;
    CW = Math.max(190, Math.min(tablet ? Math.min(vw * 0.66, 540) : vw * 0.86, (avail - fixed) / COVER + PAD * 2));
    CH = (CW - PAD * 2) * COVER;
    // whatever height is left over is shared out — a little more above than below — so the
    // stack sits balanced in the space under the title instead of leaving a hole at the bottom
    const spare = Math.max(0, avail - (CH + fixed));
    const folderTop = tb + GAP_TOP + TAB + spare * 0.4;
    fy = folderTop + PAD + CH / 2;
    CAPH = PH;
    rowTop = folderTop + PAD + CH + PH + GAP_ROW + spare * 0.25; // (the last 35% stays under the controls)
  } else {
    // Desktop: the same folder + controls. It stands beside the title when there's room (so it can
    // rise to just under the header and be big), and under the title, centred, when there isn't.
    const fixed = TAB + PAD + PH + GAP_ROW + ROW;
    const sizeUnder = (tb: number) => Math.max(240, Math.min(440, vw * 0.3, (vh - 28 - tb - GAP_TOP - fixed) / COVER + PAD * 2));
    const header = 92;
    const tRight = titleRight || left + 470;
    let tb = header;
    let cw = sizeUnder(tb);
    let cx = Math.max(vw / 2, tRight + 48 + cw / 2);
    if (cx + cw / 2 > vw - 240) {
      // no room beside it (the depth rail lives on the right): sit under the title instead
      tb = titleBottom || vh * 0.13 + 124;
      cw = sizeUnder(tb);
      cx = vw / 2;
    }
    CW = cw;
    CH = (CW - PAD * 2) * COVER;
    fx = cx;
    const spare = Math.max(0, vh - 28 - tb - GAP_TOP - (CH + fixed));
    const folderTop = tb + GAP_TOP + TAB + spare * 0.4;
    fy = folderTop + PAD + CH / 2;
    CAPH = PH;
    rowTop = folderTop + PAD + CH + PH + GAP_ROW + spare * 0.25;
  }
  const capTop = fy + CH / 2 + 8; // the folder's lower part

  // the shells ride around the whole stage block (card + caption), tilted like the atom's own
  const sy = (fy - CH / 2 + capTop + CAPH - 16) / 2;
  const span = (capTop + CAPH - 16 - (fy - CH / 2)) / 2;
  const shells = mobile
    ? [
        { rx: vw * (tablet ? 0.5 : 0.47), ry: span + 34, tilt: -8, dir: 1 },
        { rx: vw * (tablet ? 0.56 : 0.53), ry: span + 46, tilt: 9, dir: -1 },
        { rx: vw * (tablet ? 0.6 : 0.58), ry: span + 58, tilt: -4, dir: 1 },
      ]
    : [
        { rx: CW * 0.95, ry: span + 30, tilt: -12, dir: 1 },
        { rx: CW * 1.3, ry: span + 10, tilt: 14, dir: -1 },
        { rx: CW * 1.62, ry: span - 10, tilt: -8, dir: 1 },
      ];
  // the frame: a rounded rect hugging the cover (r = 12px, inset 1px)
  const FR = { w: CW - 3, h: CH - 3, r: 10.5 };
  const PER = 2 * (FR.w + FR.h) - 8 * FR.r + 2 * Math.PI * FR.r;
  const sw = CW * REST;
  const sh = sw * COVER + (mobile ? 0 : 22);
  // zones the electrons pass *behind* (they fade there instead of covering text)
  const veils = [
    { l: fx - CW / 2 - 8, r: fx + CW / 2 + 8, t: capTop - 10, b: capTop + CAPH - 8 }, // the folder's lower part
    { l: 0, r: mobile ? vw : left + 470, t: 0, b: mobile ? top - 8 : vh * 0.13 + 124 }, // title
    { l: 0, r: vw, t: bottom + 6, b: vh }, // "All projects"
    // the controls — an electron never crosses them (over the card itself they simply pass behind)
    { l: 0, r: vw, t: rowTop - 6, b: rowTop + ROW + 6 },
    // desktop: the depth rail on the right — the orbit never writes over it
    ...(mobile ? [] : [{ l: vw - 230, r: vw, t: 0, b: vh }]),
  ];

  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const trails = useRef<(SVGLineElement | null)[]>([]);
  const frames = useRef<(SVGRectElement | null)[]>([]);
  const imgs = useRef<(HTMLSpanElement | null)[]>([]);
  // phones & tablets — the folder: the sheet (cover) that lifts out, the front (tab + text)
  const sheets = useRef<(HTMLSpanElement | null)[]>([]);
  const fronts = useRef<(HTMLSpanElement | null)[]>([]);
  const focusSince = useRef<number[]>([]);
  const shellsG = useRef<SVGGElement>(null);
  const spin = useRef(0);
  const idle = useRef(false);
  const [active, setActive] = useState(0);
  // where the stage is between projects (eases to `index` on every turn)
  // (an unhurried in-out turn: the hand-over should read as a calm orbit, not a flick)
  const at = useMotionValue(index);
  const indexRef = useRef(index);
  const releasedAt = useRef(-1e9);
  useEffect(() => {
    indexRef.current = index;
    // right after a finger let go the stage is already moving: carry on (ease-out), don't restart
    const fromFinger = performance.now() - releasedAt.current < 200;
    const c = animate(at, index, {
      duration: reduce ? 0 : fromFinger ? 0.55 : 0.8,
      ease: fromFinger ? [0.33, 1, 0.68, 1] : [0.4, 0, 0.2, 1],
    });
    return () => c.stop();
  }, [index, at, reduce]);

  // gentle auto-advance (phones & tablets): while you rest on the work, the next project comes
  // forward every few seconds; any touch pauses it; it stops at the last project
  const onIndexRef = useRef(onIndex);
  useEffect(() => {
    onIndexRef.current = onIndex;
  });
  const lastTouch = useRef(0);
  useEffect(() => {
    if (!mobile || !enabled || reduce) return;
    lastTouch.current = performance.now() - 3500; // the first one comes ~5.5s after arriving
    const mark = () => void (lastTouch.current = performance.now());
    window.addEventListener("touchstart", mark, { passive: true });
    window.addEventListener("pointerdown", mark, { passive: true });
    const id = window.setInterval(() => {
      if (performance.now() - lastTouch.current < 9000) return; // a hand was just here: wait
      const i = indexRef.current;
      if (i < N - 1) onIndexRef.current(i + 1);
    }, 5500);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("pointerdown", mark);
    };
  }, [mobile, enabled, reduce, N]);

  // touch: while a finger is on the work, the stage follows it — a full turn takes ~60% of the
  // screen's width, and past the first / last project it only gives a little (a soft edge).
  // On release the stage carries on from exactly where the finger left it.
  const held = useRef(0);
  useMotionValueEvent(drag, "change", (dx) => {
    if (Number.isNaN(dx)) {
      if (!held.current) return;
      at.set(at.get() + held.current);
      held.current = 0;
      releasedAt.current = performance.now();
      animate(at, indexRef.current, { duration: reduce ? 0 : 0.55, ease: [0.33, 1, 0.68, 1] });
      return;
    }
    let off = -dx / (vw * 0.6);
    const base = at.get();
    const lo = -base;
    const hi = N - 1 - base;
    if (off < lo) off = lo + (off - lo) * 0.25;
    if (off > hi) off = hi + (off - hi) * 0.25;
    held.current = Math.max(-1.2, Math.min(1.2, off));
  });

  // mouse: press on a project and drag it sideways — it follows the hand, like a finger on a phone
  const dragged = useRef(false);
  const mouseDrag = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !enabled) return;
    const x0 = e.clientX;
    let dx = 0;
    dragged.current = false;
    const move = (ev: PointerEvent) => {
      dx = ev.clientX - x0;
      if (Math.abs(dx) > 6) {
        dragged.current = true;
        drag.set(dx);
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!dragged.current) return;
      drag.set(Number.NaN);
      if (Math.abs(dx) > 60) {
        const next = Math.max(0, Math.min(N - 1, indexRef.current + (dx < 0 ? 1 : -1)));
        if (next !== indexRef.current) onIndex(next);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // the first visit: the project on stage leans left and back — "there's more this way" (no words)
  const lean = useMotionValue(0);
  useEffect(() => {
    if (!enabled || reduce) return;
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch {}
    const t1 = window.setTimeout(() => {
      animate(lean, [0, -34, 0, -16, 0], { duration: 1.6, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut" });
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {}
    }, 900);
    return () => clearTimeout(t1);
  }, [enabled, reduce, lean]);
  // a soft water drop each time a different project settles in the centre (only inside The Core)
  const lastLocked = useRef(-1);
  useEffect(() => {
    if (!enabled) {
      lastLocked.current = -1;
      return;
    }
    if (lastLocked.current !== -1 && lastLocked.current !== active) uiSound.element(); // the same water bubbles as the periodic table
    lastLocked.current = active;
  }, [active, enabled]);

  useAnimationFrame((_, delta) => {
    const vis = show.get();
    if (vis <= 0.001) {
      if (!idle.current) {
        idle.current = true;
        [...cards.current, ...trails.current].forEach((el) => el && (el.style.opacity = "0"));
        cards.current.forEach((el) => el && (el.style.pointerEvents = "none"));
        if (shellsG.current) shellsG.current.style.opacity = "0";
      }
      return;
    }
    idle.current = false;
    if (shellsG.current) shellsG.current.style.opacity = String(vis);
    // electrons keep drifting — one slow lap every ~90s, never fast enough to pull the eye
    if (!reduce) spin.current += (Math.min(delta, 64) / 1000) * ((Math.PI * 2) / 90);

    const a = at.get() + held.current;
    const nudge = lean.get();

    let front = 0;
    let best = -1;
    PROJECTS.forEach((_, i) => {
      const focus = smooth(clamp(1 - Math.abs(a - i)));
      const arrive = smooth(clamp(vis * 1.9 - i * (0.9 / N)));

      // its place in orbit
      const s = shells[i % 3];
      const th = 3.5 + i * GOLDEN + spin.current * s.dir;
      const ex = s.rx * Math.cos(th);
      const ey = s.ry * Math.sin(th);
      const r = (s.tilt * Math.PI) / 180;
      let ox = fx + ex * Math.cos(r) - ey * Math.sin(r);
      const oy = sy + ex * Math.sin(r) + ey * Math.cos(r);
      const depth = (Math.sin(th) + 1) / 2; // lower half of the orbit = nearer
      ox = clamp(ox, sw * 0.2, vw - sw * 0.2); // may peek off the edge, never vanish
      let sOp = mobile ? 0.72 + 0.2 * depth : 0.55 + 0.3 * depth;
      // passing behind the caption / title / bottom bar: fade instead of covering words
      for (const v of veils) {
        const ix = Math.max(0, Math.min(ox + sw / 2, v.r) - Math.max(ox - sw / 2, v.l));
        const iy = Math.max(0, Math.min(oy + sh / 2, v.b) - Math.max(oy - sh / 2, v.t));
        sOp *= 1 - 0.95 * clamp(((ix * iy) / (sw * sh)) * 4);
      }

      // between orbit and stage
      const x = lerp(ox, fx, focus) + nudge * focus;
      const y = lerp(oy, fy, focus);
      const sc = lerp(REST * (0.88 + 0.12 * depth), 1, focus) * (0.85 + 0.15 * arrive);
      const el = cards.current[i];
      if (el) {
        el.style.transform = `translate(${(x - CW / 2).toFixed(1)}px, ${(y - CH / 2 - PAD).toFixed(1)}px) scale(${sc.toFixed(4)})`;
        el.style.opacity = (arrive * lerp(sOp, 1, focus)).toFixed(3);
        el.style.zIndex = String(focus > 0.5 ? 60 + Math.round(focus * 20) : 15 + Math.round(depth * 20));
        el.style.pointerEvents = enabled && arrive > 0.6 ? "auto" : "none";
      }
      const lb = labels.current[i];
      if (lb) lb.style.opacity = (1 - focus).toFixed(3);

      // phones & tablets: the project in focus opens like a folder — its tab and text appear, the
      // cover lifts a little out of it, then very slowly pushes in (once it has settled)
      {
        const open = smooth(clamp((focus - 0.5) / 0.5));
        const fr2 = fronts.current[i];
        if (fr2) {
          fr2.style.opacity = open.toFixed(3);
          fr2.style.transform = `translateY(${((1 - open) * 10).toFixed(1)}px)`;
        }
        const now = performance.now();
        if (focus > 0.98) focusSince.current[i] ??= now;
        else if (focus < 0.6) delete focusSince.current[i];
        const since = focusSince.current[i];
        const push = since !== undefined && !reduce ? smooth(clamp((now - since) / 6000)) : 0;
        const im = imgs.current[i];
        if (im) im.style.transform = `scale(${(1 + 0.06 * push).toFixed(4)})`;
      }

      // the frame draws itself as the project takes the stage (like the orbits in the loader)
      const draw = smooth(clamp((focus - 0.55) / 0.45));
      const fr = frames.current[i];
      if (fr) {
        fr.style.strokeDashoffset = (PER * (1 - draw)).toFixed(1);
        fr.style.opacity = draw > 0.001 ? "1" : "0";
      }
      const tr = trails.current[i];
      if (tr) {
        tr.setAttribute("x2", x.toFixed(1));
        tr.setAttribute("y2", y.toFixed(1));
        tr.style.opacity = (arrive * (1 - focus) * 0.55 * (0.5 + 0.5 * depth)).toFixed(3);
      }
      if (focus > best) {
        best = focus;
        front = i;
      }
    });
    setActive((cur) => (cur === front ? cur : front));
  });


  return (
    <div className="pointer-events-none absolute inset-0" aria-label="Projects in orbit">
      {/* the layer's title — left-aligned like every other layer */}
      <motion.div
        ref={titleBox}
        className="absolute z-[95] max-w-[30rem] sm:max-w-[40rem] lg:max-w-[30rem]"
        style={{ opacity: show, left, right: mobile ? left : undefined, top: tablet ? "calc(6.5rem + 1.5svh)" : mobile ? "calc(5.75rem + 1svh)" : "13svh" }}
      >
        <p className="mb-2.5 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-blue-glow lg:flex">
          <span>04</span>
          <span className="h-px w-8 bg-blue-glow/50" />
          <span className="text-ink-soft">Featured case studies</span>
        </p>
        <h2 className="font-serif text-[clamp(2rem,min(4.4vw,6svh),3.4rem)] sm:text-[clamp(3.25rem,8.5vw,5rem)] lg:text-[clamp(2rem,min(4.4vw,6svh),3.4rem)] leading-none tracking-[-0.02em] text-ink [text-shadow:0_2px_18px_rgb(var(--rgb-halo)/0.9)]">
          My best work, <span className="italic text-blue-glow">in orbit</span>.
        </h2>
        <p className="mt-2 text-[0.85rem] leading-snug text-ink-soft sm:mt-3 sm:text-[1.1rem] lg:mt-2 lg:text-[0.85rem]">
          Five case studies that show <span className="text-ink">how I think</span> — research to final UI.
        </p>
      </motion.div>

      {/* shells + charge lines from the nucleus to each electron (all under the cards) */}
      <svg className="absolute inset-0 z-[11] size-full overflow-visible" aria-hidden>
        <g ref={shellsG} style={{ opacity: 0 }}>
          {shells.map((s, i) => (
            <ellipse
              key={i}
              cx={fx}
              cy={sy}
              rx={s.rx}
              ry={s.ry}
              transform={`rotate(${s.tilt} ${fx} ${sy})`}
              fill="none"
              stroke="rgb(var(--rgb-glow)/var(--orbit-a))"
              strokeWidth={1}
              strokeDasharray={i === 1 ? "2 7" : undefined}
            />
          ))}
        </g>
        {PROJECTS.map((_, i) => (
          <line
            key={i}
            ref={(el) => void (trails.current[i] = el)}
            x1={fx}
            y1={fy}
            stroke="currentColor"
            className="text-blue-glow"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeDasharray="0.1 7"
            style={{ opacity: 0 }}
          />
        ))}
      </svg>

      {/* the projects: one on stage, the rest in orbit */}
      {PROJECTS.map((proj, i) => {
        const isActive = i === active;
        return (
          <div
            key={proj.name}
            ref={(el) => void (cards.current[i] = el)}
            className="absolute left-0 top-0 origin-center opacity-0 will-change-transform"
            style={{ width: CW }}
          >
              <a
                href={proj.href}
                target="_blank"
                rel="noopener noreferrer"
                data-sound={isActive ? undefined : "own"}
                onClick={(e) => {
                  if (!isActive) {
                    e.preventDefault();
                    onIndex(i);
                  }
                }}
                aria-label={isActive ? `${proj.name} — open case study on Behance` : `Show ${proj.name}`}
                tabIndex={enabled && isActive ? 0 : -1}
                onPointerDown={(e) => mouseDrag(e)}
                onClickCapture={(e) => {
                  if (dragged.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    dragged.current = false;
                  }
                }}
                draggable={false}
                className="folder relative block cursor-grab select-none text-left transition-transform duration-200 active:scale-[0.985] active:cursor-grabbing"
              >
                {/* the tab, with the project's number, and the soft inside corner where it meets the folder */}
                <span
                  aria-hidden
                  className="folder-fill absolute left-0 flex w-[38%] items-center rounded-t-[14px] px-3.5 font-mono text-[12px] font-semibold text-sand sm:px-5"
                  style={{ top: -TAB, height: TAB + 1 }}
                >
                  {String(i + 1).padStart(2, "0")}
                  <span className="ml-2 font-normal text-ink-soft">/ {String(N).padStart(2, "0")}</span>
                </span>
                <span aria-hidden className="folder-notch absolute left-[38%] size-4" style={{ top: -16 }} />
                {/* the folder: the cover sits inside it, the words and the action under it */}
                <span className="folder-fill relative block rounded-[20px] rounded-tl-none" style={{ padding: `${PAD}px ${PAD}px 0` }}>
                  <span
                    ref={(el) => void (sheets.current[i] = el)}
                    className="relative block overflow-hidden rounded-[14px]"
                    style={{ height: CH }}
                  >
                    <span ref={(el) => void (imgs.current[i] = el)} className="absolute inset-0 block will-change-transform">
                      <ProjectCover project={proj} index={i} sizes={`${Math.round(CW)}px`} />
                    </span>
                  </span>
                  <span
                    ref={(el) => void (fronts.current[i] = el)}
                    className="flex flex-col px-2 pb-3 pt-3 sm:px-3 sm:pb-4 sm:pt-4"
                    style={{ height: PH, opacity: 0 }}
                  >
                    <span className="block truncate font-mono text-[10px] uppercase text-ink-soft">{proj.meta}</span>
                    <span className="mt-1 block truncate font-serif text-[1.5rem] leading-none text-ink sm:text-[2rem]">{proj.name}</span>
                    <span className="mt-1 block truncate text-[0.9rem] text-ink-soft sm:text-[1.05rem]">{proj.what}</span>
                    {/* the one thing to do here: a real, primary button — nothing like the quiet arrows below */}
                    <span className="mt-auto flex items-center gap-3">
                      <span className={BTN_PRIMARY}>
                        Open case study
                        <span className={BTN_PRIMARY_ICON}>
                          <ArrowUpRight className="size-3.5" />
                        </span>
                      </span>
                      <span className="font-mono text-[10px] uppercase text-ink-soft">on Behance</span>
                    </span>
                  </span>
                </span>
                {/* as an electron: its number + name, so the orbit reads as "more projects" */}
                <span
                  ref={(el) => void (labels.current[i] = el)}
                  aria-hidden
                  className="absolute inset-x-0 top-full mt-[0.35em] block truncate text-center font-mono uppercase text-ink"
                  style={{ fontSize: 11 / REST }}
                >
                  <span className="text-blue-glow">{String(i + 1).padStart(2, "0")}</span> {proj.name}
                </span>
              </a>
          </div>
        );
      })}

      {/* one clear control row under the card — big arrows, where you are, how many */}
      {(
        <motion.div
          className="absolute z-[96] flex -translate-x-1/2 items-center gap-5"
          style={{ left: fx, top: rowTop, opacity: show }}
        >
          <OrbitArrow dir={-1} can={index > 0} enabled={enabled} onGo={() => onIndex(index - 1)} />
          <span className="flex min-w-[4.5rem] flex-col items-center gap-2" aria-live="polite">
            <span className="font-mono text-[12px] tabular-nums text-ink-soft">
              <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-1.5" aria-hidden>
              {PROJECTS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-4 bg-blue-glow" : "w-1.5 bg-white/25"}`} />
              ))}
            </span>
          </span>
          <OrbitArrow dir={1} can={index < N - 1} enabled={enabled} onGo={() => onIndex(index + 1)} />
        </motion.div>
      )}

      {/* progress + skip ahead to the full archive (desktop) */}
      {/* (phone & tablet: on the right — the bottom-left corner belongs to the floating "Let's talk") */}
      {!mobile && (
      <motion.div
        className={`absolute bottom-[max(3.5svh,1rem)] z-[95] flex items-center gap-5 sm:bottom-[max(4svh,1.5rem)] sm:gap-6 lg:bottom-[max(3.5svh,1rem)] lg:gap-5 ${mobile ? "right-6 sm:right-8" : ""}`}
        style={{ opacity: show, left: mobile ? undefined : left }}
      >
        {/* phone: the way on, as a quiet line (the bottom-left corner belongs to "Let's talk") */}
        {mobile ? (
          <button
            type="button"
            onClick={onAll}
            className={`inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft sm:text-[12px] ${enabled ? "pointer-events-auto" : ""}`}
          >
            Next <span className="text-blue-glow">↓</span> <span className="text-ink">More work</span>
          </button>
        ) : (
        <button
          type="button"
          onClick={onAll}
          className={`group inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-panel/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink backdrop-blur sm:px-5 sm:py-2.5 sm:text-[11.5px] lg:px-4 lg:py-2 lg:text-[10px] transition-colors hover:border-blue-glow/50 ${
            enabled ? "pointer-events-auto" : ""
          }`}
        >
          More work
          <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
        </button>
        )}
      </motion.div>
      )}
    </div>
  );
}

/** A big, plain arrow under the card (48px, clear border) — never on the image. */
function OrbitArrow({ dir, can, enabled, onGo }: { dir: 1 | -1; can: boolean; enabled: boolean; onGo: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir < 0 ? "Previous project" : "Next project"}
      aria-disabled={!can}
      onClick={() => can && onGo()}
      tabIndex={enabled ? 0 : -1}
      className={`grid size-12 touch-manipulation place-items-center rounded-full border transition-[opacity,border-color,color,transform] duration-300 active:scale-95 ${
        enabled ? "pointer-events-auto" : ""
      } ${can ? "border-white/25 bg-panel text-ink" : "border-white/10 bg-panel/60 text-ink opacity-35"}`}
    >
      <svg viewBox="0 0 16 16" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path d={dir < 0 ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
