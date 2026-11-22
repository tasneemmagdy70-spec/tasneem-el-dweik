"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Purpose: the primary CTA gently leans toward the cursor, inviting the click
 * on the single most important action in the hero.
 */
export default function MagneticButton({
  href,
  onClick,
  children,
  className = "",
  strength = 0.28,
}: {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a ref={ref} href={href} onClick={onClick} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={className}>
      {children}
    </motion.a>
  );
}
