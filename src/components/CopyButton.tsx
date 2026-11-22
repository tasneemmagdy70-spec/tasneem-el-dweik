"use client";

import { useEffect, useState } from "react";

/** Copies text to the clipboard and says so — for people who don't use a mail app. */
export default function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setDone(false), 1800);
    return () => window.clearTimeout(t);
  }, [done]);

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setDone(true))}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
        done ? "border-available/60 text-available" : "border-white/12 text-ink-soft hover:border-blue-glow/60 hover:text-ink"
      } ${className}`}
      aria-label={`Copy ${text}`}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        {done ? (
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
            <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
          </>
        )}
      </svg>
      <span aria-live="polite">{done ? "Copied" : "Copy"}</span>
    </button>
  );
}
