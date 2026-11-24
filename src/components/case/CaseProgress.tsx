"use client";

import { useEffect, useState } from "react";

/**
 * The case study's own "layer bar": where you are in the story (Overview → What's next),
 * a thin line that fills as you read, and every section one tap away.
 */
export default function CaseProgress({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      setProgress(Math.min(1, window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)));
      let a = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) a = i;
      });
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) a = sections.length - 1;
      setActive(a);
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
  }, [sections]);

  return (
    <nav aria-label="Case study sections" className="relative">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={active === i ? "location" : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[0.85rem] transition-colors ${
              active === i ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            <span className={`mr-1.5 font-mono text-[11px] ${active === i ? "text-blue-glow" : "text-ink-soft/60"}`}>{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </a>
        ))}
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      <span aria-hidden className="absolute bottom-0 left-0 h-px bg-blue-glow transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
    </nav>
  );
}
