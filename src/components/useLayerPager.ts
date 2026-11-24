"use client";

import { useEffect, useRef } from "react";
import { REST, SURFACE_LIFT, glideTo, heroY, isGliding, stopGlide } from "@/lib/depth";

/**
 * One gesture = one layer.
 *
 * Inside the pinned hero, a swipe, a wheel turn or an arrow key carries you exactly
 * one layer down (or up) and sets you down there — the copy is already waiting, so
 * there is no "how far do I have to scroll" and nothing gets skipped. From the last
 * layer (the work, in orbit) on, the page is the browser's again: scrolling down into
 * "More work" is ordinary, finger-following scroll, exactly like the rest of the page.
 *
 * Sideways gestures belong to the orbit: while the finger moves, `onSideDrag(dx)` lets the
 * projects follow it; on release `onSideDrag(null)`, then `onSide(±1)` if it went far enough.
 * `onSide` returns false when there is nothing sideways to do here.
 */
export function useLayerPager({
  enabled,
  lift,
  onSide,
  onSideDrag,
  canSide,
}: {
  enabled: boolean;
  /** phone surface: rest once with the first page lifted (only when it doesn't fit as it is) */
  lift: boolean;
  onSide: (dir: 1 | -1) => boolean;
  onSideDrag: (dx: number | null) => boolean;
  /** is there something to turn sideways right now (the work is the layer in view)? */
  canSide: () => boolean;
}) {
  const liftRef = useRef(lift);
  const sideRef = useRef(onSide);
  const dragRef = useRef(onSideDrag);
  const canSideRef = useRef(canSide);
  useEffect(() => {
    liftRef.current = lift;
    sideRef.current = onSide;
    dragRef.current = onSideDrag;
    canSideRef.current = canSide;
  });

  useEffect(() => {
    if (!enabled) return;

    /** every resting point inside the hero, top to bottom (the last one is The Core) */
    const stops = () => [0, ...(liftRef.current ? [SURFACE_LIFT] : []), REST[1], REST[2], REST[3]].map(heroY);
    const frozen = () => document.documentElement.style.overflow === "hidden"; // the menu is open
    /** is a gesture in direction dir (+1 down, −1 up) ours to handle? */
    const ours = (dir: number) => {
      const ys = stops();
      const y = window.scrollY;
      const last = ys[ys.length - 1];
      // a little slack around The Core: anywhere near it counts as "on it", so going down from
      // there is always the page's own scroll — never a pull back up
      if (y < last - 40) return true;
      return y <= last + 2 && dir < 0;
    };
    /** the work is on screen and can turn sideways (not further down the page) */
    const sideOk = () => {
      const ys = stops();
      return canSideRef.current() && window.scrollY < ys[ys.length - 1] + window.innerHeight * 0.4;
    };
    const step = (dir: 1 | -1) => {
      const ys = stops();
      const y = window.scrollY;
      const near = ys.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
      // between two layers (e.g. scrolled back up from "More work"): land on the closest one first
      const slack = near === ys[ys.length - 1] ? 40 : 2;
      if (Math.abs(near - y) > slack) return glideTo(near);
      const target = dir > 0 ? ys.find((s) => s > near + 2) : [...ys].reverse().find((s) => s < near - 2);
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

    /* ── touch ──
       The page follows the finger from the first pixel (no dead "is this enough?" zone), and
       on release it finishes the move to the next layer — or settles back if the push was only
       a nudge. A new swipe while it's still moving takes over at once and carries on. */
    let track: {
      x: number;
      y: number;
      axis: "x" | "y" | null;
      lx: number;
      lt: number;
      v: number;
      dragging: boolean;
      sy: number; // where the page was when the finger landed
      base: number; // the layer this move starts from
      ly: number;
      vy: number;
    } | null = null;
    let heading: number | null = null; // where the current glide is going
    const go = (y: number) => {
      heading = y;
      glideTo(y, () => (heading = null));
    };
    const onStart = (e: TouchEvent) => {
      track = null;
      if (frozen() || e.touches.length > 1) return;
      // a tap on a button (the orbit's ‹ ›, the layer bar…) is a tap — never let it become a swipe
      if ((e.target as Element | null)?.closest?.("button")) return;
      // the work turns sideways wherever it's on screen — even when the page sits a few pixels past
      // its resting point (a touch of native scroll, the address bar moving) — but never further down
      if (!ours(-1) && !ours(1) && !sideOk()) return;
      // still moving from the last swipe: the finger takes over from here, aiming past where it was going
      const ys = stops();
      const target = isGliding() && heading !== null ? heading : null;
      if (isGliding()) stopGlide();
      const y = window.scrollY;
      const base = target ?? ys.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
      const t = e.touches[0];
      track = { x: t.clientX, y: t.clientY, axis: null, lx: t.clientX, lt: e.timeStamp, v: 0, dragging: false, sy: y, base, ly: t.clientY, vy: 0 };
    };
    const onMove = (e: TouchEvent) => {
      if (!track) return;
      if (e.touches.length > 1) return void release(0);
      const t = e.touches[0];
      const dx = t.clientX - track.x;
      const dy = t.clientY - track.y;
      if (!track.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 6) {
        track.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        // resting on The Core, a push downward is ordinary scrolling into "More work" — the page's own
        if (track.axis === "y" && !ours(dy < 0 ? 1 : -1)) return void (track = null);
        if (track.axis === "x" && !ours(-1) && !ours(1) && !sideOk()) return void (track = null);
      }
      const dt = e.timeStamp - track.lt;
      if (track.axis === "x") {
        // the projects follow the finger (measured from where the swipe was recognised, so they don't jump)
        if (dt > 0) track.v = 0.7 * track.v + 0.3 * ((t.clientX - track.lx) / dt);
        track.dragging = dragRef.current(dx - Math.sign(dx) * 6) || track.dragging;
      }
      if (track.axis === "y") {
        if (dt > 0) track.vy = 0.6 * track.vy + 0.4 * ((t.clientY - track.ly) / dt);
        const ys = stops();
        window.scrollTo({ top: Math.max(ys[0], Math.min(ys[ys.length - 1], track.sy - dy)), behavior: "instant" });
      }
      track.lx = t.clientX;
      track.ly = t.clientY;
      track.lt = e.timeStamp;
      if (track.axis && e.cancelable) e.preventDefault();
    };
    /** end a sideways drag: hand the projects back, then turn if the swipe meant it */
    const release = (dx: number) => {
      const t = track;
      track = null;
      if (!t || t.axis !== "x") return;
      if (t.dragging) dragRef.current(null);
      // far enough, or a quick flick in a clear direction
      const flick = Math.abs(t.v) > 0.45 && Math.sign(t.v) === Math.sign(dx) && Math.abs(dx) > 20;
      if (Math.abs(dx) > 60 || flick) sideRef.current(dx < 0 ? 1 : -1);
    };
    const onEnd = (e: TouchEvent) => {
      const t = track;
      if (!t) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - t.x;
      const dy = touch.clientY - t.y;
      if (t.axis === "x") return release(dx);
      track = null;
      if (t.axis !== "y") {
        // a tap that stopped a glide: finish where it was heading
        if (Math.abs(window.scrollY - t.base) > 2) go(t.base);
        return;
      }
      const ys = stops();
      const dir = dy < 0 ? 1 : -1;
      // a short push is enough — so is a quick flick (but a slow nudge settles back)
      const meant = Math.abs(dy) > 28 || (Math.abs(t.vy) > 0.25 && Math.sign(-t.vy) === dir);
      let target = t.base;
      if (meant) {
        const next = dir > 0 ? ys.find((s) => s > t.base + 2) : [...ys].reverse().find((s) => s < t.base - 2);
        if (next !== undefined) target = next;
      }
      go(target);
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
        if (y >= ys[ys.length - 1] - 40) return; // at or past The Core: the page is the reader's
        const near = ys.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
        if (Math.abs(near - y) > 2) glideTo(near);
      }, 180);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    const onCancel = () => release(0);
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
