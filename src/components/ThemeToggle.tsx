"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { setTheme, useTheme } from "@/lib/theme";
import { uiSound } from "@/lib/uiSound";

/**
 * Dark ⇄ light. The icon shows where you'll go (a sun in the deep, a moon in
 * daylight) and turns over like a dial as it switches.
 */
export default function ThemeToggle() {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button data-sound="own"
      type="button"
      onClick={() => {
        setTheme(next);
        uiSound.theme(next);
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="relative grid size-9 place-items-center sm:size-10 overflow-hidden rounded-full border border-white/12 bg-white/[0.04] text-ink transition-colors duration-300 hover:border-blue-glow/50 hover:text-blue-glow md:size-11"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          {theme === "dark" ? (
            // sun: go to daylight
            <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <circle cx="10" cy="10" r="3.6" />
              <path
                d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // moon: back to the deep
            <svg viewBox="0 0 20 20" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8Z" strokeLinejoin="round" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
