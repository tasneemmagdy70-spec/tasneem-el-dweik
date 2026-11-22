"use client";

import { useEffect, useRef, useState } from "react";
import { uiSound } from "@/lib/uiSound";
import { animate, AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { FEATURED as PROJECTS } from "@/lib/projects";
import ProjectCover from "./ProjectCover";
import { ArrowUpRight } from "./icons";

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
const ease = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where the stage is. Shared with the Hero so the atom sits exactly behind it. */
export function coreStage(vw: number, vh: number, mobile: boolean) {
  // tablet (portrait, 640–1023px): the phone's single-column stage, scaled up to the screen
  const tablet = mobile && vw >= 640;
  const CAPH = tablet ? 186 : mobile ? 152 : 136; // gap + caption block under the card (phone: measured 129 + gap + air)
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
  show: MotionValue<number>; // 0 → 1 as the layer arrives
  enabled: boolean;
  mobile: boolean;
  vw: number;
  vh: number;
  onAll: () => void;
};

const HINT_KEY = "ed-orbit-hint";

export default function ProjectOrbit({ index, onIndex, show, enabled, mobile, vw, vh, onAll }: Props) {
  const reduce = useReducedMotion();
  const N = PROJECTS.length;
  const { CW, CH, CAPH, fx, fy, top, bottom, tablet } = coreStage(vw, vh, mobile);
  const REST = tablet ? 0.25 : mobile ? 0.3 : 0.36; // an electron's size relative to the stage card
  const capTop = fy + CH / 2 + 16;
  // the caption never gets narrower than its button needs, even when a short phone shrinks the card
  const capW = mobile && !tablet ? Math.min(vw - 48, Math.max(CW, 300)) : CW;
  const left = tablet ? 40 : mobile ? 24 : Math.max(32, (vw - 1152) / 2 + 32);

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
    { l: mobile ? 0 : fx - CW / 2 - 24, r: mobile ? vw : fx + CW / 2 + 24, t: capTop - 10, b: capTop + CAPH - 8 }, // caption
    { l: 0, r: mobile ? vw : left + 470, t: 0, b: mobile ? top - 8 : vh * 0.13 + 124 }, // title
    { l: 0, r: vw, t: bottom + 6, b: vh }, // "All projects"
  ];

  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const trails = useRef<(SVGLineElement | null)[]>([]);
  const frames = useRef<(SVGRectElement | null)[]>([]);
  const imgs = useRef<(HTMLSpanElement | null)[]>([]);
  const shellsG = useRef<SVGGElement>(null);
  const spin = useRef(0);
  const idle = useRef(false);
  const [active, setActive] = useState(0);
  // where the stage is between projects (eases to `index` on every turn)
  const at = useMotionValue(index);
  useEffect(() => {
    const c = animate(at, index, { duration: reduce ? 0 : 0.85, ease });
    return () => c.stop();
  }, [index, at, reduce]);

  // the first visit: the project on stage leans left and back — "there's more this way" —
  // and a short note says how (once per visitor)
  const lean = useMotionValue(0);
  const [hintOn, setHint] = useState(false);
  const hint = hintOn && index === 0; // turning a project is the lesson learned — the note steps aside
  useEffect(() => {
    if (!enabled || reduce) return;
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch {}
    const t1 = window.setTimeout(() => {
      setHint(true);
      animate(lean, [0, -34, 0, -16, 0], { duration: 1.6, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut" });
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {}
    }, 900);
    const t2 = window.setTimeout(() => setHint(false), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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

    const a = at.get();
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
      let sOp = mobile ? 0.5 + 0.3 * depth : 0.55 + 0.3 * depth;
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
        el.style.transform = `translate(${(x - CW / 2).toFixed(1)}px, ${(y - CH / 2).toFixed(1)}px) scale(${sc.toFixed(4)})`;
        el.style.opacity = (arrive * lerp(sOp, 1, focus)).toFixed(3);
        el.style.zIndex = String(focus > 0.5 ? 60 + Math.round(focus * 20) : 15 + Math.round(depth * 20));
        el.style.pointerEvents = enabled && arrive > 0.6 ? "auto" : "none";
      }
      const lb = labels.current[i];
      if (lb) lb.style.opacity = (1 - focus).toFixed(3);

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

  const p = PROJECTS[active];

  return (
    <div className="pointer-events-none absolute inset-0" aria-label="Projects in orbit">
      {/* the layer's title — left-aligned like every other layer */}
      <motion.div
        className="absolute z-[95] max-w-[30rem] sm:max-w-[40rem] lg:max-w-[30rem]"
        style={{ opacity: show, left, right: mobile ? left : undefined, top: tablet ? "calc(6.5rem + 1.5svh)" : mobile ? "calc(5.75rem + 1svh)" : "13svh" }}
      >
        <p className="mb-2.5 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-blue-glow lg:flex">
          <span>04</span>
          <span className="h-px w-8 bg-blue-glow/50" />
          <span className="text-ink-soft">Selected work</span>
        </p>
        <h2 className="font-serif text-[clamp(2rem,min(4.4vw,6svh),3.4rem)] sm:text-[clamp(3.25rem,8.5vw,5rem)] lg:text-[clamp(2rem,min(4.4vw,6svh),3.4rem)] leading-none tracking-[-0.02em] text-ink [text-shadow:0_2px_18px_rgb(var(--rgb-halo)/0.9)]">
          Work in <span className="italic text-blue-glow">orbit</span>.
        </h2>
        <p className="mt-2 text-[0.85rem] leading-snug text-ink-soft sm:mt-3 sm:text-[1.1rem] lg:mt-2 lg:text-[0.85rem]">
          Every project circles one nucleus — <span className="text-ink">the why</span>.
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
              // picking a side card already bubbles when it arrives in the centre
              data-sound={isActive ? undefined : "own"}
              onClick={(e) => {
                if (!isActive) {
                  e.preventDefault();
                  onIndex(i);
                }
              }}
              aria-label={isActive ? `${proj.name} — open case study on Behance` : `Show ${proj.name}`}
              tabIndex={enabled ? 0 : -1}
              className="group block transition-transform duration-200 active:scale-[0.98]"
            >
              <span
                className={`@container relative block overflow-hidden rounded-xl border shadow-[0_24px_60px_-20px_rgb(var(--rgb-shadow)/0.85)] transition-[border-color,box-shadow] duration-500 ${
                  isActive
                    ? "border-transparent shadow-[0_0_16px_-6px_rgb(var(--rgb-glow)/0.35),0_24px_60px_-28px_rgb(var(--rgb-shadow)/0.85)]"
                    : "border-white/15 group-hover:border-white/40"
                }`}
                style={{ height: CH }}
              >
                {/* cover — zooms gently on hover (desktop) / pushes in with the scroll (mobile) */}
                <span
                  ref={(el) => void (imgs.current[i] = el)}
                  className={`absolute inset-0 block will-change-transform ${mobile ? "" : "transition-transform duration-700 ease-out-expo group-hover:scale-105"}`}
                >
                  <ProjectCover project={proj} index={i} sizes={`${Math.round(CW)}px`} />
                </span>
                {/* the frame in the brand blue */}
                <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${CW} ${CH}`}>
                  <rect
                    ref={(el) => void (frames.current[i] = el)}
                    x={1.5}
                    y={1.5}
                    width={FR.w}
                    height={FR.h}
                    rx={FR.r}
                    fill="none"
                    stroke="currentColor"
                    className="text-blue-glow"
                    strokeWidth={3}
                    style={{ strokeDasharray: PER, strokeDashoffset: PER, opacity: 0 }}
                  />
                </svg>
              </span>
              {/* electron label (desktop): set large so it reads at orbit size; sits below the card's box */}
              {!mobile && (
                <span
                  ref={(el) => void (labels.current[i] = el)}
                  className="absolute inset-x-0 top-full mt-[0.4em] block truncate font-mono uppercase tracking-[0.18em] text-ink-soft"
                  style={{ fontSize: 10 / REST }}
                >
                  <span className="text-blue-glow">{String(i + 1).padStart(2, "0")}</span> {proj.name}
                </span>
              )}
            </a>
          </div>
        );
      })}

      {/* ‹ › beside the card: says, without words, that the work turns sideways */}
      {(
        [
          [-1, "Previous project"],
          [1, "Next project"],
        ] as const
      ).map(([dir, label]) => {
        const can = dir < 0 ? index > 0 : index < N - 1;
        const phone = mobile && !tablet;
        const dot = phone ? 36 : 44; // the visible circle
        const hit = 48; // the finger's target is always bigger than what you see
        // phone: centred in the margin beside the card; wider screens: a little off the card's edge
        const off = phone ? Math.max(hit / 2, (vw - CW) / 4) : CW / 2 + (mobile ? 36 : 44);
        const cx = phone ? (dir < 0 ? off : vw - off) : fx + dir * off;
        return (
          <motion.button
            key={dir}
            type="button"
            aria-label={label}
            aria-disabled={!can}
            onClick={() => can && onIndex(index + dir)}
            tabIndex={enabled ? 0 : -1}
            className={`group absolute z-[96] grid touch-manipulation place-items-center ${enabled ? "pointer-events-auto" : ""} ${can ? "" : "cursor-default"}`}
            style={{ left: cx - hit / 2, top: fy - hit / 2, width: hit, height: hit, opacity: show }}
            animate={hint && dir > 0 ? { scale: [1, 1.15, 1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 1.6 }}
          >
            <span
              className={`grid place-items-center rounded-full border bg-panel/70 backdrop-blur transition-[opacity,border-color,color] duration-300 ${
                can ? "border-white/20 text-ink group-hover:border-blue-glow/60 group-hover:text-blue-glow group-active:scale-95" : "border-white/10 text-ink opacity-30"
              }`}
              style={{ width: dot, height: dot }}
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                <path d={dir < 0 ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.button>
        );
      })}

      {/* first visit: how to turn the work */}
      <AnimatePresence>
        {hint && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.4, ease }}
            className="absolute z-[97] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-panel-deep/85 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink backdrop-blur"
            style={{ left: fx, top: fy + CH / 2 - 48 }}
          >
            {mobile ? "← Swipe for more projects →" : "← → or the arrows for more projects"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the caption: always in the same place, under the stage */}
      <motion.div className="absolute z-[90]" style={{ left: fx - capW / 2, top: capTop, width: capW, opacity: show }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}
          >
            <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-soft sm:text-[11.5px] lg:text-[9.5px]">
              <span className="text-sand">{String(active + 1).padStart(2, "0")}</span>
              <span className="mx-2 text-ink-soft/40">/</span>
              {p.meta}
            </p>
            <p className="mt-1.5 font-serif text-[1.75rem] leading-none text-ink sm:mt-2 sm:text-[2.75rem] lg:mt-1.5 lg:text-[2rem]">{p.name}</p>
            <p className="mt-1.5 truncate text-[0.88rem] text-ink-soft sm:mt-2 sm:text-[1.1rem] lg:mt-1.5 lg:text-[0.88rem]">{p.what}</p>
            <div className="mt-3.5 flex items-center gap-3 sm:mt-5 lg:mt-3.5">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={enabled ? 0 : -1}
                className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-cta hover:bg-cta-hover py-1.5 pl-4 pr-1.5 text-[0.85rem] font-medium text-on-cta shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-300 md:py-2 md:pl-5 md:pr-2 md:text-[0.9rem] sm:py-2.5 sm:pl-6 sm:pr-2 sm:text-[1.05rem] lg:py-2 lg:pl-5 lg:text-[0.9rem] ${
                  enabled ? "pointer-events-auto" : ""
                }`}
              >
                <span className="relative">Open case study</span>
                <span className="relative grid size-7 place-items-center rounded-full bg-on-cta text-blue md:size-8 sm:size-9 lg:size-8">
                  <span className="relative block size-3.5 overflow-hidden">
                    <ArrowUpRight className="absolute inset-0 size-full transition-transform duration-500 ease-out-expo group-hover:-translate-y-full group-hover:translate-x-full" />
                    <ArrowUpRight className="absolute inset-0 size-full -translate-x-full translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0" />
                  </span>
                </span>
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:text-[11px] lg:text-[10px]">on Behance</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* progress + skip ahead to the full archive */}
      {/* (phone & tablet: on the right — the bottom-left corner belongs to the floating "Let's talk") */}
      <motion.div
        className={`absolute bottom-[max(3.5svh,1rem)] z-[95] flex items-center gap-5 sm:bottom-[max(4svh,1.5rem)] sm:gap-6 lg:bottom-[max(3.5svh,1rem)] lg:gap-5 ${mobile ? "right-6 sm:right-8" : ""}`}
        style={{ opacity: show, left: mobile ? undefined : left }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft tabular-nums sm:text-[12px] lg:text-[10px]">
          <span className="text-sand">{String(active + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
        </span>
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
    </div>
  );
}
