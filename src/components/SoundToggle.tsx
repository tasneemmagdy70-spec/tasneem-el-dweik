"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { uiSound } from "@/lib/uiSound";

const subscribe = (fn: () => void) => uiSound.subscribe(fn);
const getOn = () => uiSound.on;
const getOnServer = () => false;

export function useSoundOn() {
  return useSyncExternalStore(subscribe, getOn, getOnServer);
}

/**
 * The sound switch: a flat line when off, a softly moving waveform when on.
 * Off by default. If the visitor turned it on last time, it comes back at their
 * first gesture (browsers need one before any sound).

 */
export default function SoundToggle() {
  const on = useSoundOn();
  const reduce = useReducedMotion();

  // resume a remembered "on" at the first gesture
  useEffect(() => {
    if (!uiSound.remembered || uiSound.on) return;
    const resume = () => void uiSound.enable();
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", resume, opts);
    window.addEventListener("keydown", resume, opts);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  // every button and link answers with the same water bubbles as the periodic table.
  // (Controls that already have their own sound — the menu, theme, this switch, the
  // periodic tiles — opt out with data-sound="own", so nothing ever plays twice.)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!uiSound.on) return;
      const t = e.target as Element | null;
      const hit = t?.closest?.("button, a[href], [role='button']");
      if (!hit || hit.closest("[data-sound='own']")) return;
      uiSound.element();
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  const bars = [0.35, 0.8, 0.5, 1, 0.6];
  return (
    <button
      type="button"
      onClick={() => void uiSound.toggle()}
      data-sound="own"
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      title={on ? "Sound on" : "Sound off"}
      className="relative grid size-9 place-items-center sm:size-10 rounded-full border border-white/12 bg-white/[0.04] text-ink-soft transition-colors duration-300 hover:border-blue-glow/50 hover:text-ink md:size-11"
    >
      <span className="flex h-3.5 items-center gap-[2.5px]" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className={`w-[2px] rounded-full ${on ? "bg-blue-glow" : "bg-current"}`}
            initial={false}
            animate={
              on && !reduce ? { height: [`${h * 100}%`, `${(1.15 - h) * 100}%`, `${h * 100}%`] } : { height: on ? `${h * 100}%` : "2px" }
            }
            transition={on && !reduce ? { duration: 1.1 + i * 0.13, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          />
        ))}
      </span>
    </button>
  );
}
