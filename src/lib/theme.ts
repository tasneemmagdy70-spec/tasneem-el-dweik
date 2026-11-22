"use client";

import { useSyncExternalStore } from "react";

/**
 * Dark ("the deep") is the portfolio's home; light is the same dive in daylight.
 * The theme lives on <html data-theme>, so every colour token switches at once.
 * The choice is remembered; the inline script in layout.tsx applies it before
 * the first paint, so there is never a flash of the wrong theme.
 */
export type Theme = "dark" | "light";
import { THEME_KEY as KEY } from "./theme-boot";
const EVENT = "ed-themechange";


export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(t: Theme) {
  const root = document.documentElement;
  // a soft cross-fade while every colour changes, then out of the way
  root.classList.add("theme-fade");
  root.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
  window.setTimeout(() => root.classList.remove("theme-fade"), 500);
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    getTheme,
    () => "dark",
  );
}

/** Read an "r g b" channel token (e.g. --rgb-particle) for canvas drawing. */
export function rgbToken(name: string, fallback = "160 185 255") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  return v.split(/\s+/).join(",");
}
