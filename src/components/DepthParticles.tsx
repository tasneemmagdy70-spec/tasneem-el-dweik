"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { rgbToken } from "@/lib/theme";

/**
 * Fine particles drifting upward — the visitor reads it as sinking.
 * Scrolling (diving) makes them rush past faster, then they settle again.
 */
export default function DepthParticles({ progress, reduce, calm = false }: { progress: MotionValue<number>; reduce: boolean; calm?: boolean }) {
  // calm (phones): the same dots at under half the speed, and no streaks while scrolling — there,
  // but never enough to pull the eye from the words
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const k = calm ? 0.4 : 1;
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = w < 768 ? 45 : 90;
    const ps = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      v: Math.random() * 0.25 + 0.08,
      a: Math.random() * 0.5 + 0.15,
      drift: Math.random() * Math.PI * 2,
    }));

    // particle colour follows the theme (pale blue in the deep, royal blue in daylight)
    let rgb = rgbToken("--rgb-particle");
    const boostOf = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--particle-boost")) || 1;
    let pBoost = boostOf();
    const onTheme = () => {
      rgb = rgbToken("--rgb-particle");
      pBoost = boostOf();
    };
    window.addEventListener("ed-themechange", onTheme);

    let last = progress.get();
    let boost = 0;

    const draw = () => {
      const p = progress.get();
      const dp = p - last;
      last = p;
      boost += (Math.min(40, Math.abs(dp) * 2600) - boost) * 0.12;

      ctx.clearRect(0, 0, w, h);
      for (const q of ps) {
        if (!reduce) {
          q.y -= q.v * k * (1 + boost * k) * (dp < 0 ? -1 : 1);
          q.drift += 0.01 * k;
          q.x += Math.sin(q.drift) * 0.15 * k;
          if (q.y < -5) { q.y = h + 5; q.x = Math.random() * w; }
          if (q.y > h + 5) { q.y = -5; q.x = Math.random() * w; }
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${Math.min(1, q.a * pBoost)})`;
        // stretch into streaks while rushing past
        if (!calm && boost > 2) {
          ctx.fillRect(q.x, q.y, q.r, q.r * (1 + boost * 0.6));
        } else {
          ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("ed-themechange", onTheme);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [progress, reduce, calm]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
