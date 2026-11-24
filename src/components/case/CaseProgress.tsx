"use client";

import { useEffect, useState } from "react";

/** A hairline under the top bar that fills as you read — how far along the story you are. */
export default function CaseProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      setProgress(Math.min(1, window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);
  return (
    <span
      aria-hidden
      className="absolute bottom-0 left-0 h-[2px] bg-blue-glow transition-[width] duration-150"
      style={{ width: `${progress * 100}%` }}
    />
  );
}
