"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A section arrives once — a short rise and fade as it enters the screen, then stays still.
 * Visible by default (the server's HTML, slow phones, no JavaScript): only what is still below
 * the screen when the page wakes up waits for its entrance. Nothing is ever hidden on load.
 */
export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "waiting" | "in">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen: stays put
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    // (deferred, so the update isn't synchronous inside the effect)
    const t = window.setTimeout(() => {
      setState("waiting");
      io.observe(el);
    }, 0);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);
  const hidden = state === "waiting";
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out-expo ${hidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"} ${className}`}
      style={{ transitionDelay: state === "in" ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
