"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * X-RAY LENS — the signature interaction of "Beneath the Surface".
 *
 * A blueprint of the hero lives underneath the real one. The cursor carries a
 * small lens: it peeks at the wireframe without hiding the real UI, and when it
 * lands on a designed element it swells a little and a tag beside it tells the
 * reasoning ("the why"). Any element marked with `data-xray-label` /
 * `data-xray-note` is picked up automatically.
 *
 * Touch devices get a toggle that floods the whole view with the x-ray.
 */

type Box = { id: number; x: number; y: number; w: number; h: number; label: string; note: string };

const LENS = 34; // resting lens radius (px) — a peek, not a curtain
const LENS_HOT = 46; // over an annotated element

export default function XRay({
  container,
  enabled,
}: {
  container: RefObject<HTMLElement | null>;
  enabled: boolean;
}) {
  const layer = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const boxesRef = useRef<Box[]>([]);
  const [hot, setHot] = useState<Box | null>(null);
  const hotId = useRef<number | null>(null);
  const [layerH, setLayerH] = useState(9999);
  const [touch, setTouch] = useState(false);
  const [floodOn, setFlood] = useState(false);
  const flood = floodOn && enabled;

  // lens state lives outside React to stay at 60fps
  const s = useRef({ x: -999, y: -999, tx: -999, ty: -999, r: 0, tr: 0, inside: false });

  const measure = () => {
    const root = container.current;
    if (!root) return;
    const base = root.getBoundingClientRect();
    setLayerH(base.height);
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-xray-label]"));
    const next = els
      .map((el, id) => {
        const r = el.getBoundingClientRect();
        return {
          id,
          x: r.left - base.left,
          y: r.top - base.top,
          w: r.width,
          h: r.height,
          label: el.dataset.xrayLabel ?? "",
          note: el.dataset.xrayNote ?? "",
        };
      })
      .filter((b) => b.w > 0 && b.h > 0 && b.y < base.height);
    boxesRef.current = next;
    setBoxes(next);
  };

  useEffect(() => {
    const t = window.setTimeout(() => setTouch(window.matchMedia("(hover: none)").matches), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!enabled) {
      s.current.tr = 0;
      return;
    }
    const first = window.setTimeout(measure, 0);
    const t = window.setInterval(measure, 600); // follows layout shifts / magnetic CTA
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(first);
      clearInterval(t);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // pointer → lens target
  useEffect(() => {
    const root = container.current;
    if (!root || touch) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const b = root.getBoundingClientRect();
      s.current.tx = e.clientX - b.left;
      s.current.ty = e.clientY - b.top;
      s.current.inside = true;
      if (s.current.x < -500) {
        s.current.x = s.current.tx;
        s.current.y = s.current.ty;
      }
    };
    const leave = () => (s.current.inside = false);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, [container, touch]);

  // render loop: smooth lens position + radius, find what's under the lens
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const st = s.current;
      const active = enabled && st.inside && !flood;

      // which annotated element is the lens on? (smallest box wins: the accent beats the headline)
      let found: Box | null = null;
      if (active) {
        for (const b of boxesRef.current) {
          if (st.tx >= b.x && st.tx <= b.x + b.w && st.ty >= b.y && st.ty <= b.y + b.h) {
            if (!found || b.w * b.h < found.w * found.h) found = b;
          }
        }
      }
      if ((found?.id ?? null) !== hotId.current) {
        hotId.current = found?.id ?? null;
        setHot(found);
      }

      st.tr = flood ? 2400 : active ? (found ? LENS_HOT : LENS) : 0;
      st.x += (st.tx - st.x) * 0.22;
      st.y += (st.ty - st.y) * 0.22;
      st.r += (st.tr - st.r) * (flood ? 0.06 : 0.18);

      const el = layer.current;
      if (el) {
        const cx = flood ? el.clientWidth / 2 : st.x;
        const cy = flood ? el.clientHeight * 0.6 : st.y;
        const m = `radial-gradient(circle ${Math.max(0, st.r).toFixed(1)}px at ${cx}px ${cy}px, #000 calc(100% - 1px), transparent 100%)`;
        el.style.maskImage = m;
        el.style.webkitMaskImage = m;
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${st.x}px, ${st.y}px) translate(-50%, -50%) scale(${(st.r / LENS).toFixed(3)})`;
        ring.current.style.opacity = flood ? "0" : Math.min(1, st.r / LENS).toFixed(3);
      }
      if (tag.current) {
        // tag rides beside the lens; flips to the left near the right edge
        const w = tag.current.offsetWidth;
        const roomRight = (layer.current?.clientWidth ?? 9999) - st.x;
        const dx = roomRight > w + LENS_HOT + 24 ? LENS_HOT + 14 : -(w + LENS_HOT + 14);
        tag.current.style.transform = `translate(${st.x + dx}px, ${st.y - 14}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, flood]);

  return (
    <>
      {/* the blueprint beneath */}
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[60] bg-panel"
        style={{ maskImage: "radial-gradient(circle 0px at 0 0, #000, transparent)", WebkitMaskImage: "radial-gradient(circle 0px at 0 0, #000, transparent)" }}
      >
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--rgb-glow)/0.09)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--rgb-glow)/0.09)_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--rgb-glow)/0.16)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--rgb-glow)/0.16)_1px,transparent_1px)] [background-size:60px_60px]" />

        {boxes.map((b) => {
          const below = b.y + b.h + 70 < layerH;
          return (
            <div key={b.id} className="absolute" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}>
              <div className="absolute inset-0 rounded-[3px] border border-dashed border-blue-glow/70 bg-blue-bright/[0.06]" />
              <span className="absolute -left-1 -top-1 size-2 border-l border-t border-blue-glow" />
              <span className="absolute -bottom-1 -right-1 size-2 border-b border-r border-blue-glow" />
              {/* wireframe hint: the element as grey bars */}
              <span className="absolute inset-x-[10%] top-1/2 h-[18%] max-h-3 -translate-y-1/2 rounded-sm bg-blue-glow/15" />
              {/* full annotations only when the whole page is x-rayed (touch) */}
              {flood && (
                <>
                  <span className="absolute -top-[18px] left-0 whitespace-nowrap bg-blue-bright px-1.5 py-[1px] font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-on-cta">
                    {b.label}
                  </span>
                  <p
                    className={`absolute left-0 w-[min(240px,80vw)] font-mono text-[10px] leading-snug text-blue-glow ${below ? "top-[calc(100%+6px)]" : "bottom-[calc(100%+22px)]"}`}
                  >
                    ↳ {b.note}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* lens ring + crosshair */}
      {!touch && (
        <div
          ref={ring}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-[61] rounded-full border border-blue-glow/70 shadow-[0_0_0_1px_rgb(var(--rgb-halo)/0.5),0_0_22px_rgb(var(--rgb-bright)/0.45)]"
          style={{ width: LENS * 2, height: LENS * 2, opacity: 0 }}
        >
          <span className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-blue-glow/80" />
          <span className="absolute left-1/2 top-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 bg-blue-glow/80" />
        </div>
      )}

      {/* the why — a small tag that rides beside the lens */}
      {!touch && (
        <div ref={tag} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[62] w-max max-w-[230px]">
          <AnimatePresence mode="wait">
            {hot && (
              <motion.div
                key={hot.id}
                initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -4, filter: "blur(4px)", transition: { duration: 0.12 } }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-md border border-blue-glow/30 bg-panel/95 px-2.5 py-2 shadow-[0_10px_30px_-10px_rgb(var(--rgb-shadow)/0.8)] backdrop-blur"
              >
                <div className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-glow">
                  ◎ {hot.label} <span className="text-ink-soft">· {Math.round(hot.w)}×{Math.round(hot.h)}</span>
                </div>
                <p className="font-mono text-[10.5px] leading-snug text-ink">{hot.note}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* touch: x-ray toggle */}
      <AnimatePresence>
        {touch && enabled && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setFlood((f) => !f)}
            aria-pressed={flood}
            className="absolute left-4 top-[5rem] z-[62] flex items-center gap-1.5 rounded-full border border-blue-glow/40 bg-panel/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-blue-glow backdrop-blur"
          >
            {flood ? "◉ Surface" : "◎ X-ray"}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
