"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * THE ATOM ASSEMBLES — first-visit loader.
 *
 * Particles drift in from the dark and swirl toward the centre while three
 * orbits draw themselves and their electrons spin up. The counter climbs to
 * 100%; then the whole atom collapses into a single point of light — the spark
 * the portrait is born from. It's the "Beneath the Surface" story told before a
 * word is read: everything starts from something small.
 */

const RINGS = [
  { rx: 150, ry: 46, tilt: -14, speed: 1.6 },
  { rx: 184, ry: 70, tilt: 16, speed: -1.15 },
  { rx: 212, ry: 94, tilt: -30, speed: 0.85 },
];
const C = 300; // svg centre (viewBox 600)
const COUNT_FROM = 84; // where the visible counter starts
const STATUS: [number, string][] = [
  [0, "Gathering particles"],
  [22, "Binding the nucleus"],
  [46, "Charging electrons"],
  [70, "Calibrating orbits"],
  [92, "Going beneath the surface"],
];

/** Ramanujan's approximation of an ellipse's perimeter (for the draw-on stroke). */
const perimeter = (a: number, b: number) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
const rad = (d: number) => (d * Math.PI) / 180;

/** Loading never feels linear: fast start, a hesitation, then a confident finish. */
function curve(t: number) {
  const k = Math.min(1, Math.max(0, t));
  const a = k < 0.45 ? 0.62 * (1 - Math.pow(1 - k / 0.45, 2)) : k < 0.62 ? 0.62 + 0.08 * ((k - 0.45) / 0.17) : 0.7 + 0.3 * (1 - Math.pow(1 - (k - 0.62) / 0.38, 3));
  return Math.min(1, a);
}

export default function Loader({
  visible,
  running,
  duration,
  instant,
  onSkip,
}: {
  visible: boolean;
  running: boolean;
  duration: number;
  instant: boolean;
  onSkip: () => void;
}) {
  const [pct, setPct] = useState(COUNT_FROM);
  const [prog, setProg] = useState(0);
  const ringEls = useRef<(SVGEllipseElement | null)[]>([]);
  const dotEls = useRef<(SVGCircleElement | null)[]>([]);
  const partEls = useRef<(SVGCircleElement | null)[]>([]);

  // particles: random start positions far outside the atom (stable per mount)
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const a = (i / 34) * Math.PI * 2 + ((i * 7919) % 100) / 60;
        const d = 260 + ((i * 104729) % 240);
        return { a, d, r: 0.8 + ((i * 31) % 10) / 6, delay: ((i * 13) % 34) / 34 };
      }),
    []
  );

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = performance.now();
    const angles = RINGS.map((_, i) => i * 2.1);
    let last = start;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const p = curve((now - start) / duration);
      setProg(p);
      // The counter starts most of the way there and ticks through the last stretch:
      // a slow, readable 84 → 100 feels calm and "almost ready", where 0 → 100 in a few
      // seconds just races past. (The atom itself still assembles across the whole run.)
      setPct(Math.round(COUNT_FROM + p * (100 - COUNT_FROM)));

      RINGS.forEach((r, i) => {
        // each ring draws in its own window of the progress
        const local = Math.min(1, Math.max(0, (p - i * 0.18) / 0.5));
        const L = perimeter(r.rx, r.ry);
        const el = ringEls.current[i];
        if (el) el.style.strokeDashoffset = String(L * (1 - local));
        // electrons spin faster as energy builds
        angles[i] += r.speed * dt * (0.6 + p * 3.2);
        const x = r.rx * Math.cos(angles[i]);
        const y = r.ry * Math.sin(angles[i]);
        const t = rad(r.tilt);
        const dot = dotEls.current[i];
        if (dot) {
          dot.setAttribute("cx", String(C + x * Math.cos(t) - y * Math.sin(t)));
          dot.setAttribute("cy", String(C + x * Math.sin(t) + y * Math.cos(t)));
          dot.style.opacity = String(local);
        }
      });

      // particles swirl inward and dissolve into the core
      particles.forEach((pt, i) => {
        const el = partEls.current[i];
        if (!el) return;
        const k = Math.min(1, Math.max(0, (p - pt.delay * 0.5) / 0.55));
        const e = 1 - Math.pow(1 - k, 3);
        const a = pt.a + e * 1.6;
        const d = pt.d * (1 - e) + 6;
        el.setAttribute("cx", String(C + Math.cos(a) * d));
        el.setAttribute("cy", String(C + Math.sin(a) * d * 0.8));
        el.style.opacity = String(k <= 0 ? 0.25 : (1 - e) * 0.9 + 0.05);
      });

      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, duration, particles]);

  const status = [...STATUS].reverse().find(([at]) => prog * 100 >= at)?.[1] ?? STATUS[0][1];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${instant ? 99 : pct}%`}
          className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-paper"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: instant ? 0.15 : 0.7, delay: instant ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] } }}
        >
          {/* faint light from above, same water column as the hero */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(var(--rgb-bright)/0.28),transparent_70%)]" />

          {/* the atom being assembled — collapses to a point on exit */}
          <motion.div
            className="relative w-[min(92vw,62svh,560px)]"
            exit={{ scale: 0.02, opacity: 0, transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
          >
            {/* the greeting, inside the atom's own space — just above its orbits:
                "Welcome to my" quietly, then "universe." large, as if the atom is forming it */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[71%] z-10 flex flex-col items-center text-center">
              <span className="flex gap-[0.3em] font-serif text-[clamp(1.05rem,2.6svh,1.5rem)] leading-none tracking-[0.01em] text-ink-soft">
                {["Welcome", "to", "my"].map((w, i) => (
                  <motion.span
                    key={w}
                    className="inline-block"
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: instant ? 0.2 : 0.8, delay: instant ? 0 : 0.2 + i * 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
              <motion.span
                className="mt-1 inline-block font-serif text-[clamp(2.7rem,7svh,4.4rem)] italic leading-[0.95] tracking-[-0.02em] text-blue-glow [text-shadow:0_0_28px_rgb(var(--rgb-bright)/0.35)]"
                initial={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: instant ? 0.25 : 1.3, delay: instant ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                universe.
              </motion.span>
            </div>
            <svg viewBox="0 0 600 600" className="block size-full overflow-visible" aria-hidden>
              <defs>
                <radialGradient id="ldCore">
                  <stop offset="0%" style={{ stopColor: "var(--atom-hot)" }} stopOpacity="0.95" />
                  <stop offset="35%" style={{ stopColor: "var(--color-blue-glow)" }} stopOpacity="0.55" />
                  <stop offset="100%" style={{ stopColor: "var(--color-blue-bright)" }} stopOpacity="0" />
                </radialGradient>
              </defs>
              {particles.map((pt, i) => (
                <circle key={i} ref={(el) => void (partEls.current[i] = el)} r={pt.r} style={{ fill: "var(--color-blue-glow)" }} opacity={0} />
              ))}
              {RINGS.map((r, i) => {
                const L = perimeter(r.rx, r.ry);
                return (
                  <ellipse
                    key={i}
                    ref={(el) => void (ringEls.current[i] = el)}
                    cx={C}
                    cy={C}
                    rx={r.rx}
                    ry={r.ry}
                    transform={`rotate(${r.tilt} ${C} ${C})`}
                    fill="none"
                    stroke="rgb(var(--rgb-glow)/0.5)"
                    strokeWidth={1.2}
                    style={{ strokeDasharray: L, strokeDashoffset: L }}
                  />
                );
              })}
              {RINGS.map((_, i) => (
                <circle key={i} ref={(el) => void (dotEls.current[i] = el)} r={4} opacity={0} style={{ fill: i === 2 ? "var(--color-sand)" : "var(--color-ink)", filter: "drop-shadow(0 0 6px rgb(var(--rgb-glow)/0.9))" }} />
              ))}
              {/* the core grows with the energy */}
              <circle cx={C} cy={C} r={18 + prog * 50} fill="url(#ldCore)" />
            </svg>

            {/* counter, sitting in the nucleus */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="flex items-start font-serif leading-none text-ink [text-shadow:0_0_24px_rgb(var(--rgb-bright)/0.35)]">
                <span className="text-[clamp(3.6rem,10svh,5.5rem)] tabular-nums tracking-[-0.03em]">{String(instant ? 99 : pct).padStart(2, "0")}</span>
                <span className="mt-2 font-mono text-[11px] text-blue-glow">%</span>
              </div>
            </div>
          </motion.div>

          {/* status line */}
          <motion.div
            className="absolute inset-x-0 bottom-[16svh] flex flex-col items-center gap-3"
            exit={{ opacity: 0, y: 8, transition: { duration: 0.25 } }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft"
              >
                {status}
              </motion.p>
            </AnimatePresence>
            <span className="relative h-px w-40 overflow-hidden bg-white/10">
              <span className="absolute inset-y-0 left-0 bg-blue-glow transition-[width] duration-100" style={{ width: `${prog * 100}%` }} />
            </span>
          </motion.div>

          {/* corners: who this is, before anything else */}
          <motion.div
            className="absolute inset-x-5 bottom-6 flex justify-between gap-4 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft sm:tracking-[0.25em] md:inset-x-8"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <span>Tasneem El-Dweik</span>
            <span>UI/UX &amp; Product Designer</span>
          </motion.div>
          {/* a way out, always in reach: the intro is a welcome, never a wait */}
          <motion.button
            type="button"
            onClick={onSkip}
            className="absolute right-3 top-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-ink md:right-6 md:top-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            Skip intro <span aria-hidden>→</span>
          </motion.button>
          <motion.span
            className="absolute left-5 top-4 font-script text-[2.1rem] leading-none text-ink/80 md:left-8 md:top-6 md:text-[2.6rem]"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            El-Dweik
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
