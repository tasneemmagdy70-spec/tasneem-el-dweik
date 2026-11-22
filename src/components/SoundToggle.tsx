"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { uiSound } from "@/lib/uiSound";

const subscribe = (fn: () => void) => uiSound.subscribe(fn);
const getOn = () => uiSound.on;
const getOnServer = () => true;

export function useSoundOn() {
  return useSyncExternalStore(subscribe, getOn, getOnServer);
}

/**
 * Invisible: wakes the audio engine at the visitor's first gesture (browsers allow no sound
 * before one), then answers every button and link with the same water bubbles as the
 * periodic table. Controls that already have their own sound — the menu, the theme, the
 * sound switch, the periodic tiles — opt out with data-sound="own", so nothing plays twice.
 */
export function SoundEffects() {
  useEffect(() => {
    const wake = () => {
      if (uiSound.on) void uiSound.unlock();
    };
    const onClick = (e: MouseEvent) => {
      if (!uiSound.on) return;
      const t = e.target as Element | null;
      const hit = t?.closest?.("button, a[href], [role='button']");
      if (!hit || hit.closest("[data-sound='own']")) return;
      uiSound.element();
    };
    window.addEventListener("pointerdown", wake, { capture: true, passive: true });
    window.addEventListener("keydown", wake, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", wake, { capture: true });
      window.removeEventListener("keydown", wake, { capture: true });
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);
  return null;
}

/**
 * The way out, kept quiet: a small "Sound · On/Off" line in the menu and the footer —
 * there for anyone who needs silence, never competing for the header.
 */
export function SoundSwitch({ className = "" }: { className?: string }) {
  const on = useSoundOn();
  const reduce = useReducedMotion();
  const bars = [0.4, 0.9, 0.55, 1];
  return (
    <button
      type="button"
      data-sound="own"
      onClick={async () => {
        await uiSound.toggle();
        // turning it on answers with a bubble, so you hear what you switched on
        if (uiSound.on) uiSound.element();
      }}
      aria-pressed={on}
      className={`group inline-flex min-h-11 items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink ${className}`}
    >
      <span className="flex h-3 items-center gap-[2px]" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className={`w-[2px] rounded-full ${on ? "bg-blue-glow" : "bg-current"}`}
            initial={false}
            animate={on && !reduce ? { height: [`${h * 100}%`, `${(1.15 - h) * 100}%`, `${h * 100}%`] } : { height: on ? `${h * 100}%` : "2px" }}
            transition={on && !reduce ? { duration: 1.1 + i * 0.13, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          />
        ))}
      </span>
      Sound <span className={on ? "text-blue-glow" : ""}>{on ? "On" : "Off"}</span>
    </button>
  );
}
