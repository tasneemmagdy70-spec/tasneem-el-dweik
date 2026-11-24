"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A row of cards you swipe on phones and tablets, laid out as a grid on desktop.
 * Phones have no hover, so the card that has come to rest in view is marked
 * `data-active` — it lifts and glows, which tells you where you are in the row.
 */
export default function SnapStrip({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    const items = Array.from(ul.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.target as HTMLElement).dataset.active = e.intersectionRatio > 0.8 ? "true" : "false";
      },
      { root: ul, threshold: [0, 0.8, 1] },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <ul
      ref={ref}
      className={`flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 pt-2 [scrollbar-width:none] lg:grid lg:snap-none lg:overflow-visible [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </ul>
  );
}
