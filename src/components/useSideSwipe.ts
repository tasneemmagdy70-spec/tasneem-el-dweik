"use client";

import { useEffect, useRef } from "react";

/**
 * Sideways swipes on one element (the work, in orbit), inside an otherwise ordinary scroll:
 * up/down stays the browser's own scrolling; left/right is ours. While the finger moves,
 * `onDrag(dx)` lets the projects follow it; on release `onDrag(null)`, then `onSide(±1)` when
 * the swipe went far enough (or was a clear flick). Pair with `touch-action: pan-y`.
 */
export function useSideSwipe(el: HTMLElement | null, onSide: (dir: 1 | -1) => void, onDrag: (dx: number | null) => void) {
  const side = useRef(onSide);
  const drag = useRef(onDrag);
  useEffect(() => {
    side.current = onSide;
    drag.current = onDrag;
  });

  useEffect(() => {
    if (!el) return;
    let t: { x: number; y: number; axis: "x" | "y" | null; lx: number; lt: number; v: number } | null = null;

    const start = (e: TouchEvent) => {
      t = null;
      if (e.touches.length > 1) return;
      // a tap on a button (the ‹ › arrows, "Open case study") stays a tap
      if ((e.target as Element | null)?.closest?.("button")) return;
      const p = e.touches[0];
      t = { x: p.clientX, y: p.clientY, axis: null, lx: p.clientX, lt: e.timeStamp, v: 0 };
    };
    const move = (e: TouchEvent) => {
      if (!t) return;
      const p = e.touches[0];
      const dx = p.clientX - t.x;
      const dy = p.clientY - t.y;
      if (!t.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 10) t.axis = Math.abs(dx) > Math.abs(dy) * 1.1 ? "x" : "y";
      if (t.axis === "y") return void (t = null); // the page's scroll
      if (t.axis !== "x") return;
      if (e.cancelable) e.preventDefault();
      const dt = e.timeStamp - t.lt;
      if (dt > 0) t.v = 0.7 * t.v + 0.3 * ((p.clientX - t.lx) / dt);
      t.lx = p.clientX;
      t.lt = e.timeStamp;
      drag.current(dx - Math.sign(dx) * 10);
    };
    const end = (e: TouchEvent) => {
      const s = t;
      t = null;
      if (!s || s.axis !== "x") return;
      const dx = (e.changedTouches[0]?.clientX ?? s.lx) - s.x;
      drag.current(null);
      const flick = Math.abs(s.v) > 0.45 && Math.sign(s.v) === Math.sign(dx) && Math.abs(dx) > 20;
      if (Math.abs(dx) > 60 || flick) side.current(dx < 0 ? 1 : -1);
    };

    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end, { passive: true });
    el.addEventListener("touchcancel", end, { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
  }, [el]);
}
