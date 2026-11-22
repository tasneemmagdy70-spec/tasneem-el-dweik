"use client";

import { useEffect, useRef } from "react";
import { REST, SURFACE_LIFT, glideTo, heroY, isGliding } from "@/lib/depth";

/**
 * One gesture = one layer.
 *
 * Inside the pinned hero, a swipe, a wheel turn or an arrow key carries you exactly
 * one layer down (or up) and sets you down there — the copy is already waiting, so
 * there is no "how far do I have to scroll" and nothing gets skipped. From the last
 * layer (the work, in orbit) the next swipe lands on "More work", and from there the
 * page scrolls freely as usual.
 *
 * Sideways gestures belong to the orbit: `onSide(±1)` turns to the next / previous
 * project, and returns false when there is nothing sideways to do here.
 */
export function useLayerPager({
  enabled,
  lift,
  onSide,
}: {
  enabled: boolean;
  /** phone surface: rest once with the first page lifted (only when it doesn't fit as it is) */
  lift: boolean;
  onSide: (dir: 1 | -1) => boolean;
}) {
  const liftRef = useRef(lift);
  const sideRef = useRef(onSide);
  useEffect(() => {
    liftRef.current = lift;
    sideRef.current = onSide;
  });

  useEffect(() => {
    if (!enabled) return;

    /** every resting point, top to bottom, ending with the top of "More work" */
    const stops = () => {
      const rs = [0, ...(liftRef.current ? [SURFACE_LIFT] : []), REST[1], REST[2], REST[3]];
      const ys = rs.map(heroY);
      const work = document.getElementById("work");
      if (work) ys.push(work.getBoundingClientRect().top + window.scrollY);
      return ys;
    };
    const frozen = () => document.documentElement.style.overflow === "hidden"; // the menu is open
    /** is a gesture in direction dir (+1 down, −1 up) ours to handle? */
    const ours = (dir: number) => {
      const ys = stops();
      const y = window.scrollY;
      const last = ys[ys.length - 1];
      if (y < last - 2) return true;
      return Math.abs(y - last) <= 2 && dir < 0; // at the top of "More work", going back up
    };
    const step = (dir: 1 | -1) => {
      const ys = stops();
      const y = window.scrollY;
      const target = dir > 0 ? ys.find((s) => s > y + 2) : [...ys].reverse().find((s) => s < y - 2);
      if (target !== undefined) glideTo(target);
    };

    /* ── wheel & trackpad ── */
    let acc = 0;
    let accX = 0;
    let lastT = 0;
    let lastAbs = 0;
    let blocked = false; // after a step: swallow the rest of that flick's momentum
    const onWheel = (e: WheelEvent) => {
      if (frozen() || e.ctrlKey) return;
      const now = performance.now();
      const gap = now - lastT;
      lastT = now;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const abs = Math.abs(sideways ? e.deltaX : e.deltaY);
      const tail = gap < 140 && abs <= lastAbs * 1.15 + 1; // a decaying momentum tail, not a new push
      lastAbs = abs;

      if (sideways) {
        if (!ours(-1) && !ours(1)) return;
        if (isGliding() || (blocked && tail)) return void e.preventDefault();
        if (gap > 250) accX = 0;
        accX += e.deltaX;
        if (Math.abs(accX) >= 40) {
          if (sideRef.current(accX > 0 ? 1 : -1)) {
            blocked = true;
            e.preventDefault();
          }
          accX = 0;
        }
        return;
      }

      const dir = e.deltaY > 0 ? 1 : -1;
      if (!ours(dir)) return;
      e.preventDefault();
      if (isGliding()) return void (blocked = true);
      if (blocked) {
        if (tail) return;
        blocked = false;
      }
      if (gap > 250) acc = 0;
      acc += e.deltaY;
      if (Math.abs(acc) >= 40) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        blocked = true;
      }
    };

    /* ── touch ── */
    let track: { x: number; y: number; axis: "x" | "y" | null } | null = null;
    const onStart = (e: TouchEvent) => {
      track = null;
      if (frozen() || e.touches.length > 1) return;
      // a tap on a button (the orbit's ‹ ›, the layer bar…) is a tap — never let it become a swipe
      if ((e.target as Element | null)?.closest?.("button")) return;
      if (!ours(-1) && !ours(1)) return;
      track = { x: e.touches[0].clientX, y: e.touches[0].clientY, axis: null };
    };
    const onMove = (e: TouchEvent) => {
      if (!track) return;
      if (e.touches.length > 1) return void (track = null);
      const dx = e.touches[0].clientX - track.x;
      const dy = e.touches[0].clientY - track.y;
      if (!track.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 12) track.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      // at the top of "More work" a push upward is ordinary scrolling — let the page have it
      if (track.axis === "y" && !ours(dy < 0 ? 1 : -1)) return void (track = null);
      if (track.axis && e.cancelable) e.preventDefault();
    };
    const onEnd = (e: TouchEvent) => {
      const t = track;
      track = null;
      if (!t || !t.axis || isGliding()) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - t.x;
      const dy = touch.clientY - t.y;
      if (t.axis === "y" && Math.abs(dy) > 36) step(dy < 0 ? 1 : -1);
      if (t.axis === "x" && Math.abs(dx) > 40) sideRef.current(dx < 0 ? 1 : -1);
    };

    /* ── keys ── */
    const onKey = (e: KeyboardEvent) => {
      if (frozen() || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const interactive = !!el?.closest?.("a,button");
      let dir: 1 | -1 | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !interactive && !e.shiftKey)) dir = 1;
      if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && !interactive && e.shiftKey)) dir = -1;
      if (dir) {
        if (!ours(dir)) return;
        e.preventDefault();
        if (!isGliding()) step(dir);
        return;
      }
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && sideRef.current(e.key === "ArrowRight" ? 1 : -1)) e.preventDefault();
    };

    /* ── anything else that moved the page (scrollbar, momentum from below, find-in-page):
          once it settles inside the hero, come to rest on the nearest layer ── */
    let settle = 0;
    const onScroll = () => {
      clearTimeout(settle);
      if (isGliding() || track) return;
      settle = window.setTimeout(() => {
        if (isGliding() || track || frozen()) return;
        const ys = stops();
        const y = window.scrollY;
        if (y >= ys[ys.length - 1] - 2) return;
        const near = ys.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
        if (Math.abs(near - y) > 2) glideTo(near);
      }, 180);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    const onCancel = () => void (track = null);
    window.addEventListener("touchcancel", onCancel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(settle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);
}
