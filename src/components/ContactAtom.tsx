"use client";

import { useId, useRef } from "react";
import { motion, useAnimationFrame, useReducedMotion } from "motion/react";

/**
 * The dive ends where it began: the same nucleus as the hero — three translucent
 * blue lobes turning slowly, the skill rings around them, an electron on each.
 * While `charged` (the reader is about to reach out), the electrons speed up and
 * the core brightens: energy gathering for the one step that matters.
 */

// the hero's lobe shape (rx 1.22R × ry 0.56R), scaled to this box
const R = 150;
const LOBES = [
  { rot: -60, grad: "B", breathe: 0 },
  { rot: 60, grad: "C", breathe: 1.2 },
  { rot: 0, grad: "A", breathe: 2.4 },
];
const RINGS = [
  { rx: 250, ry: 78, tilt: -16, speed: 0.3, phase: 0.4 },
  { rx: 272, ry: 104, tilt: 22, speed: -0.22, phase: 2.2 },
  { rx: 232, ry: 132, tilt: 70, speed: 0.18, phase: 4.1 },
];

export default function ContactAtom({ charged, className = "" }: { charged: boolean; className?: string }) {
  const reduce = useReducedMotion();
  // unique per instance: the phone and desktop copies both live in the page, and a
  // gradient id that resolves into the hidden copy would paint nothing
  const uid = useId().replace(/:/g, "");
  const id = (k: string) => `ct${k}-${uid}`;
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const t = useRef(0);
  const speed = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    // ease toward the target speed so the change feels physical, not switched
    speed.current += ((charged ? 4.5 : 1) - speed.current) * Math.min(1, delta / 260);
    t.current += (Math.min(delta, 64) / 1000) * speed.current;
    RINGS.forEach((o, i) => {
      const a = o.phase + t.current * o.speed * Math.PI;
      const el = dots.current[i];
      if (!el) return;
      el.setAttribute("cx", (o.rx * Math.cos(a)).toFixed(1));
      el.setAttribute("cy", (o.ry * Math.sin(a)).toFixed(1));
    });
  });

  return (
    <div className={`pointer-events-none relative aspect-square ${className}`} aria-hidden>
      {/* ambient glow, as behind the hero's atom */}
      <div
        className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(var(--rgb-bright)/0.3),transparent_65%)] blur-2xl transition-opacity duration-700"
        style={{ opacity: charged ? 1 : 0.7 }}
      />
      {/* isolate: the lobes blend only with each other (as in the hero), never with the page —
          otherwise in daylight they wash out into the light background */}
      <svg viewBox="-300 -300 600 600" className="relative isolate size-full overflow-visible">
        <defs>
          <linearGradient id={id("LobeA")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4c72f0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={id("LobeB")} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fa8ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={id("LobeC")} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#2f55c7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0f1f5c" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id={id("Core")}>
            <stop offset="0%" stopColor="#8fa8ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8fa8ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* the skill rings, behind */}
        {RINGS.map((o, i) => (
          <ellipse
            key={`r${i}`}
            rx={o.rx}
            ry={o.ry}
            transform={`rotate(${o.tilt})`}
            fill="none"
            stroke="rgb(var(--rgb-glow)/var(--ring-a))"
            strokeWidth={1.2}
          />
        ))}

        {/* the orbitals: overlapping translucent lobes, turning very slowly */}
        <motion.g animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 140, repeat: Infinity, ease: "linear" }}>
          {LOBES.map((l) => (
            <g key={l.rot} transform={`rotate(${l.rot})`} style={{ mixBlendMode: "screen" }}>
              <motion.ellipse
                rx={R * 1.22}
                ry={R * 0.56}
                fill={`url(#${id("Lobe" + l.grad)})`}
                animate={reduce ? undefined : { scale: [1, 1.045, 1] }}
                transition={{ duration: 7, delay: l.breathe, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          ))}
          <circle
            r={R * 0.62}
            fill={`url(#${id("Core")})`}
            style={{ opacity: charged ? 1 : 0.7, transition: "opacity 0.8s" }}
          />
        </motion.g>

        {/* electrons, in front */}
        {RINGS.map((o, i) => (
          <g key={`e${i}`} transform={`rotate(${o.tilt})`}>
            <circle
              ref={(el) => void (dots.current[i] = el)}
              cx={(o.rx * Math.cos(o.phase)).toFixed(1)}
              cy={(o.ry * Math.sin(o.phase)).toFixed(1)}
              r={5}
              style={{ fill: i === 2 ? "var(--color-sand)" : "var(--color-blue-glow)", filter: "drop-shadow(0 0 6px rgb(var(--rgb-glow)/0.9))" }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
