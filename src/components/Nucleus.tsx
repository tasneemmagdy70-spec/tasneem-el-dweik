"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { DrawEllipse, DrawPath } from "./DrawStroke";
import { STAGE } from "./useIntro";

/**
 * The "nucleus": Tasneem's portrait inside a bloom of atomic orbitals, with her
 * skills orbiting like electrons. Laid out in a 600×600 design space and
 * converted to % so the whole system scales fluidly with its container.
 */

type Chip = { label: string; kind: "skill" | "tool" };
type Ring = { rx: number; ry: number; tilt: number; period: number; dir: 1 | -1; phase: number; chips: Chip[] };

/** Transparent cut-out, cropped to the figure. (Sharper re-edit; the cut-out mask was carried over from the previous cut-out of the same shot.) */
const PORTRAIT = { src: "/images/tasneem-v5.png", w: 780, h: 1155 };

const BOX = 600;
const NX = 300;
const NY = 340;

const DESKTOP_RINGS: Ring[] = [
  {
    rx: 205, ry: 62, tilt: -14, period: 34, dir: 1, phase: 0.4,
    chips: [
      { label: "UX Research", kind: "skill" },
      { label: "UI Design", kind: "skill" },
    ],
  },
  {
    rx: 252, ry: 94, tilt: 16, period: 46, dir: -1, phase: 1.3,
    chips: [
      { label: "Prototyping", kind: "skill" },
      { label: "Wireframing", kind: "skill" },
      { label: "Usability Testing", kind: "skill" },
    ],
  },
  {
    rx: 286, ry: 126, tilt: -30, period: 60, dir: 1, phase: 2.6,
    chips: [
      { label: "Figma", kind: "tool" },
      { label: "Maze", kind: "tool" },
    ],
  },
];
// Mobile keeps all three orbits, a little narrower: the nucleus bleeds past the screen edges there.
const MOBILE_RINGS: Ring[] = DESKTOP_RINGS.map((r) => ({ ...r, rx: r.rx * 0.72, ry: r.ry * 0.95 }));

const ease = [0.16, 1, 0.3, 1] as const;
const pct = (v: number) => `${(v / BOX) * 100}%`;
const rad = (d: number) => (d * Math.PI) / 180;

function point(ring: Ring, theta: number, rf = 1) {
  const x = ring.rx * rf * Math.cos(theta);
  const y = ring.ry * rf * Math.sin(theta);
  const t = rad(ring.tilt);
  return {
    x: NX + x * Math.cos(t) - y * Math.sin(t),
    y: NY + x * Math.sin(t) + y * Math.cos(t),
    depth: Math.sin(theta), // >0 = front half (toward the viewer)
  };
}

/** Front half of a ring, drawn above the portrait so rings visibly wrap around it. */
function frontArc(ring: Ring) {
  const a = point(ring, 0);
  const b = point(ring, Math.PI);
  return `M ${a.x} ${a.y} A ${ring.rx} ${ring.ry} ${ring.tilt} 0 1 ${b.x} ${b.y}`;
}

type Props = {
  stage: number;
  instant: boolean;
  reduce: boolean;
  compact: boolean;
  /** per-ring labels for the current chapter (same shape as the rings' chips) */
  labels?: string[][];
  /** when the parent scales the whole atom down, scale the words back up so they stay readable */
  labelBoost?: number | MotionValue<number>;
  /** 1 = portrait visible, 0 = gone (deeper layers show only the atom's structure) */
  portrait?: MotionValue<number>;
  /** opacity of the orbiting words (0 when the atom is just a backdrop) */
  words?: MotionValue<number>;
};

export default function Nucleus({ stage, instant, reduce, compact, labels, labelBoost = 1, portrait, words }: Props) {
  const boostTarget = () => (typeof labelBoost === "number" ? labelBoost : labelBoost.get());
  const boost = useRef(1);
  const rings = compact ? MOBILE_RINGS : DESKTOP_RINGS;
  const P = compact ? 0.9 : 1; // portrait + orbital scale
  const R = 170 * P;

  // Portrait geometry: feet fade out at the orbital bloom's lower edge, head rises above it.
  const imgW = 2 * R * 0.98;
  const imgH = imgW * (PORTRAIT.h / PORTRAIT.w);
  const imgBottom = NY + R * 1.02;
  const imgTop = imgBottom - imgH;

  const sparkOn = stage >= STAGE.spark;
  const burst = stage >= STAGE.burst;
  const electrons = stage >= STAGE.electrons;
  const done = stage >= STAGE.done;
  const dur = (d: number) => (instant ? 0.3 : d);

  /* ── electrons ─────────────────────────────────────────────── */
  const box = useRef<HTMLDivElement>(null);
  const chipEls = useRef(new Map<string, HTMLDivElement>());
  const pull = useRef(new Map<string, { x: number; y: number }>());
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const state = useRef<{ rings: Ring[] | null; angles: number[]; speed: number[]; target: number[] }>({
    rings: null, angles: [], speed: [], target: [],
  });
  const radius = useMotionValue(0); // 0 = all electrons at the nucleus, 1 = on their orbits

  useEffect(() => {
    if (!electrons) return;
    const c = animate(radius, 1, { duration: instant ? 0 : 2, ease });
    return () => c.stop();
  }, [electrons, instant, radius]);

  const sync = () => {
    const s = state.current;
    if (s.rings !== rings) {
      s.rings = rings;
      s.angles = rings.map((r) => r.phase);
      s.speed = rings.map(() => 1);
      s.target = rings.map(() => 1);
    }
    return s;
  };

  const clash = useRef(new Map<string, number>()); // per word: 1 = shown, 0 = stepped aside
  const place = (dt: number) => {
    const { angles } = sync();
    const rect = box.current?.getBoundingClientRect();
    const unit = rect ? rect.width / BOX : 1;
    const rf = radius.get();
    // read every width before writing any style (avoids layout thrash)
    const widths = new Map<string, number>();
    chipEls.current.forEach((el, key) => widths.set(key, el.offsetWidth));
    const heights = new Map<string, number>();
    chipEls.current.forEach((el, key) => heights.set(key, el.offsetHeight));
    const vw = window.innerWidth;
    const placed: { key: string; el: HTMLDivElement; x: number; y: number; s: number; depth: number; op: number }[] = [];
    rings.forEach((ring, ri) => {
      ring.chips.forEach((_, ci) => {
        const key = `${ri}-${ci}`;
        const el = chipEls.current.get(key);
        if (!el) return;
        const theta = angles[ri] + (ci / ring.chips.length) * Math.PI * 2;
        const p = point(ring, theta, rf);

        // Purpose: electrons lean toward a nearby cursor — the system feels alive and responsive.
        let tx = 0, ty = 0;
        const m = mouse.current;
        if (m && rect && done && !reduce) {
          const cx = rect.left + p.x * unit;
          const cy = rect.top + p.y * unit;
          const dx = m.x - cx, dy = m.y - cy;
          const d = Math.hypot(dx, dy);
          const reach = 150;
          if (d < reach) {
            const f = (1 - d / reach) ** 2 * 0.35;
            tx = (dx * f) / unit;
            ty = (dy * f) / unit;
          }
        }
        const cur = pull.current.get(key) ?? { x: 0, y: 0 };
        const k = Math.min(1, dt * 8);
        cur.x += (tx - cur.x) * k;
        cur.y += (ty - cur.y) * k;
        pull.current.set(key, cur);

        const front = p.depth > 0;
        const s = (0.86 + 0.14 * ((p.depth + 1) / 2)) * (0.5 + 0.5 * rf) * boost.current;
        // Purpose: the nucleus can be wider than the phone — keep every word fully on screen.
        let x = p.x + cur.x;
        if (rect) {
          const half = ((widths.get(key) ?? 0) * s) / 2 + 6;
          const px = rect.left + x * unit;
          const clamped = Math.min(Math.max(px, half), vw - half);
          x += (clamped - px) / unit;
        }
        const op = Math.min(1, rf * 1.5) * (front ? 1 : 0.55 + 0.35 * (1 + p.depth));
        placed.push({ key, el, x, y: p.y + cur.y, s, depth: p.depth, op });
      });
    });

    // Desktop: two words never sit on top of each other. When two orbits carry their words
    // across the same spot, the one further back steps aside (fades) until they've passed —
    // smoothly, so nothing flickers. (Phones keep their own behaviour.)
    if (!compact && unit > 0) {
      const box2 = (c: (typeof placed)[number]) => {
        const w = ((widths.get(c.key) ?? 0) * c.s) / unit / 2 + 4;
        const h = ((heights.get(c.key) ?? 0) * c.s) / unit / 2 + 2;
        return { l: c.x - w, r: c.x + w, t: c.y - h, b: c.y + h };
      };
      const hide = new Set<string>();
      for (let i = 0; i < placed.length; i++)
        for (let j = i + 1; j < placed.length; j++) {
          const a = box2(placed[i]);
          const b = box2(placed[j]);
          if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) hide.add(placed[i].depth < placed[j].depth ? placed[i].key : placed[j].key);
        }
      placed.forEach((c) => {
        const f = clash.current.get(c.key) ?? 1;
        const next = f + ((hide.has(c.key) ? 0 : 1) - f) * Math.min(1, dt * 10);
        clash.current.set(c.key, next);
        c.op *= next;
      });
    }

    placed.forEach(({ el, x, y, s, depth, op }) => {
      el.style.left = pct(x);
      el.style.top = pct(y);
      el.style.transform = `translate(-50%, -50%) scale(${s.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = depth > 0 ? "40" : "5";
    });
  };

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 64) / 1000;
    // scroll-linked boosts follow directly; number boosts ease along with the parent's animated scale
    boost.current = typeof labelBoost === "number" ? boost.current + (labelBoost - boost.current) * Math.min(1, dt * 3.5) : boostTarget();
    if (!reduce) {
      const s = sync();
      rings.forEach((ring, i) => {
        s.speed[i] += (s.target[i] - s.speed[i]) * Math.min(1, dt * 4);
        s.angles[i] += ring.dir * ((Math.PI * 2) / ring.period) * dt * s.speed[i];
      });
    }
    place(dt);
  });

  /* ── cursor: parallax + electron attraction ────────────────── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const ringX = useTransform(sx, (v) => v * 16);
  const ringY = useTransform(sy, (v) => v * 12);
  const photoX = useTransform(sx, (v) => v * 6);
  const photoY = useTransform(sy, (v) => v * 4);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.current = { x: e.clientX, y: e.clientY };
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => (mouse.current = null);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, mx, my]);

  /* ── click the nucleus: energy pulse ───────────────────────── */
  const [pulses, setPulses] = useState<number[]>([]);
  const pulse = () => {
    if (!done || reduce) return;
    const id = Date.now();
    setPulses((p) => [...p.slice(-2), id]);
    const s = sync();
    s.speed = s.speed.map(() => 9); // electrons surge, then ease back to orbit speed
  };

  let chipIndex = 0;

  return (
    <div ref={box} className="relative aspect-square w-full select-none">
      {/* ambient glow */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[57%] size-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--rgb-bright)/0.28),transparent_65%)] blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: burst ? 1 : 0 }}
        transition={{ duration: dur(2) }}
      />

      {/* back rings */}
      <motion.svg viewBox={`0 0 ${BOX} ${BOX}`} className="absolute inset-0 z-[1] size-full overflow-visible" style={{ x: ringX, y: ringY }} aria-hidden>
        {rings.map((r, i) => (
          <DrawEllipse
            key={`${compact}-${i}`}
            cx={NX} cy={NY} rx={r.rx} ry={r.ry}
            transform={`rotate(${r.tilt} ${NX} ${NY})`}
            fill="none" stroke="rgb(var(--rgb-glow)/var(--ring-a))" strokeWidth={1.2}
            play={electrons} instant={instant} duration={1.9} delay={i * 0.14}
          />
        ))}
      </motion.svg>

      {/* orbitals: overlapping translucent lobes, a quiet nod to chemistry */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-[10]"
        style={{ x: photoX, y: photoY }}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={burst ? { scale: 1, opacity: 1 } : { scale: 0.1, opacity: 0 }}
        transition={{ duration: dur(1.9), ease }}
      >
        <motion.svg
          viewBox={`0 0 ${BOX} ${BOX}`}
          className="size-full overflow-visible"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
          style={{ originX: `${(NX / BOX) * 100}%`, originY: `${(NY / BOX) * 100}%` }}
        >
          <defs>
            <linearGradient id="lobeA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4c72f0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="lobeB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fa8ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="lobeC" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#2f55c7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0f1f5c" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="core">
              <stop offset="0%" stopColor="#8fa8ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8fa8ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[
            { rot: -60, fill: "url(#lobeB)", breathe: 0 },
            { rot: 60, fill: "url(#lobeC)", breathe: 1.2 },
            { rot: 0, fill: "url(#lobeA)", breathe: 2.4 },
          ].map((l) => (
            // rotation lives on the <g> so Motion's scale transform can't override it
            <g key={l.rot} transform={`rotate(${l.rot} ${NX} ${NY})`} style={{ mixBlendMode: "screen" }}>
              <motion.ellipse
                cx={NX} cy={NY} rx={R * 1.22} ry={R * 0.56}
                fill={l.fill}
                animate={reduce ? undefined : { scale: [1, 1.045, 1] }}
                transition={{ duration: 7, delay: l.breathe, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          ))}
          <circle cx={NX} cy={NY} r={R * 0.62} fill="url(#core)" />
        </motion.svg>
      </motion.div>

      {/* spark — the first point of light */}
      <AnimatePresence>
        {sparkOn && !burst && !instant && (
          <motion.div
            aria-hidden
            className="absolute z-[50] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-cta shadow-[0_0_24px_8px_rgba(47,85,199,0.65),0_0_60px_20px_rgba(30,58,138,0.35)]"
            style={{ left: pct(NX), top: pct(NY) }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: 1 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.7, ease }}
          />
        )}
      </AnimatePresence>

      {/* shockwaves: on the burst, and on every click of the nucleus */}
      {burst && !instant && <Shockwave key="burst" slow />}
      {pulses.map((id) => (
        <Shockwave key={id} onDone={() => setPulses((p) => p.filter((x) => x !== id))} />
      ))}

      {/* portrait — born from the light, lower edge dissolving into the orbitals */}
      <motion.div
        className={`absolute z-[20] ${done && !reduce ? "cursor-pointer" : ""}`}
        style={{ left: pct(NX - imgW / 2), top: pct(imgTop), width: pct(imgW), x: photoX, y: photoY, opacity: portrait }}
        onClick={pulse}
      >
        <motion.div
          className="[mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
          initial={{ clipPath: "circle(0% at 50% 72%)", opacity: 0 }}
          animate={burst ? { clipPath: "circle(85% at 50% 72%)", opacity: 1 } : { clipPath: "circle(0% at 50% 72%)", opacity: 0 }}
          transition={{ duration: dur(2.2), delay: instant ? 0 : 0.15, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className="relative">
            <Image
              src={PORTRAIT.src}
              alt="Tasneem El-Dweik"
              width={PORTRAIT.w}
              height={PORTRAIT.h}
              // eager, not preloaded: the intro gives it seconds to arrive, and a preload hint
              // whose size didn't match the real one made browsers download the portrait twice.
              // sizes = the portrait's real width (~55% of the atom box: min(130vw, 64svh)).
              loading="eager"
              quality={95}
              sizes="(max-width: 1023px) min(72vw, 36vh), 320px"
              className="h-auto w-full [filter:drop-shadow(0_0_24px_rgb(var(--rgb-bright)/0.18))]"
              draggable={false}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* front arcs */}
      <motion.svg viewBox={`0 0 ${BOX} ${BOX}`} className="pointer-events-none absolute inset-0 z-[30] size-full overflow-visible" style={{ x: ringX, y: ringY }} aria-hidden>
        {rings.map((r, i) => (
          <DrawPath
            key={`${compact}-${i}`}
            d={frontArc(r)}
            fill="none" stroke="rgb(var(--rgb-glow)/0.55)" strokeWidth={1.3}
            play={electrons} instant={instant} duration={1.8} delay={0.15 + i * 0.14}
          />
        ))}
      </motion.svg>

      {/* electrons */}
      <motion.div className="absolute inset-0" style={{ x: ringX, y: ringY, opacity: words }}>
        {rings.map((ring, ri) =>
          ring.chips.map((chip, ci) => {
            const order = chipIndex++;
            return (
              <div
                key={`${ri}-${ci}`}
                ref={(el) => {
                  const key = `${ri}-${ci}`;
                  if (el) chipEls.current.set(key, el);
                  else chipEls.current.delete(key);
                }}
                className="absolute left-1/2 top-1/2 opacity-0 will-change-transform"
                // Purpose: hovering an electron pauses its orbit so it can be read comfortably.
                onPointerEnter={() => (sync().target[ri] = 0)}
                onPointerLeave={() => (sync().target[ri] = 1)}
              >
                {/* Bare word riding the orbit. The dark halo "cuts" the line behind it so the word reads as part of the path. */}
                <span
                  className={`flex cursor-default whitespace-nowrap px-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 [text-shadow:0_0_6px_var(--color-paper),0_0_10px_var(--color-paper),0_0_14px_var(--color-paper)] hover:text-blue-glow md:text-[0.72rem] ${ri === 2 ? "text-sand" : "text-ink"}`}
                  data-order={order}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={labels?.[ri]?.[ci] ?? chip.label}
                      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                      transition={{ duration: 0.4, ease }}
                    >
                      {labels?.[ri]?.[ci] ?? chip.label}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}

function Shockwave({ onDone, slow = false }: { onDone?: () => void; slow?: boolean }) {
  return (
    <>
      {[0, 0.12].map((d) => (
        <motion.div
          key={d}
          aria-hidden
          className="pointer-events-none absolute z-[45] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue/50"
          style={{ left: pct(NX), top: pct(NY), width: pct(120), height: pct(120) }}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 4.2, opacity: 0 }}
          transition={{ duration: slow ? 1.7 : 1.1, delay: slow ? d * 2 : d, ease: [0.2, 0.7, 0.3, 1] }}
          onAnimationComplete={d > 0 ? onDone : undefined}
        />
      ))}
    </>
  );
}
