/**
 * The page as layers, top to bottom. The first four live inside the pinned hero
 * (#top) and are reached by scroll *depth*; the rest are ordinary sections.
 * Shared by the hero, the menu and every "go to" button so they always agree.
 */

/** Where each hero layer starts in the hero's scroll (0–1): four equal quarters. */
export const RAW_STOPS = [0, 0.25, 0.5, 0.75, 1];
/** Where each hero layer comes to rest — one swipe moves you exactly one of these. */
export const REST = [0, 0.3, 0.55, 1];
/** Phone surface: a half-step that lifts the first page so the headline + actions show in full. */
export const SURFACE_LIFT = 0.08;

export const LAYERS = [
  { n: "01", name: "Surface", note: "Who I am", depth: 0 },
  { n: "02", name: "The Why", note: "How I think", depth: 120 },
  { n: "03", name: "Process", note: "How I work", depth: 240 },
  { n: "04", name: "Selected work", note: "The strongest projects", depth: 360 },
  { n: "05", name: "More work", note: "Earlier experiments", id: "work", depth: 420 },
  { n: "06", name: "What I do", note: "Services & tools", id: "services", depth: 480 },
  { n: "07", name: "Contact", note: "Let's talk", id: "contact", depth: 540 },
] as const;

/* ── phone & tablet: the layers are ordinary sections, one under the other ([data-layer]) ── */

/** true when the page is laid out as a plain scroll (phone / tablet), not the pinned dive */
export const isFlow = () => typeof document !== "undefined" && !!document.querySelector('section[data-layer="1"]');

function flowSections() {
  return [...document.querySelectorAll<HTMLElement>("[data-layer]")].sort((a, b) => Number(a.dataset.layer) - Number(b.dataset.layer));
}

/** the layer you're reading: the last one whose top has risen past the middle of the screen
 *  (and the last layer once the page can't scroll any further) */
export function flowLayer() {
  const els = flowSections();
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) return els.length - 1;
  let i = 0;
  for (const el of els) if (el.getBoundingClientRect().top <= window.innerHeight * 0.45) i = Number(el.dataset.layer);
  return i;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── the glide: one eased trip between two resting points ── */
let glideRaf = 0;
let gliding = false;
export const isGliding = () => gliding;

export function glideTo(y: number, done?: () => void) {
  cancelAnimationFrame(glideRaf);
  const from = window.scrollY;
  const d = y - from;
  if (Math.abs(d) < 1 || reduced()) {
    window.scrollTo({ top: y, behavior: "instant" });
    gliding = false;
    done?.();
    return;
  }
  // long enough to read as a move between layers, never long enough to feel like waiting
  const dur = Math.min(1100, 650 + (Math.abs(d) / window.innerHeight) * 140);
  const t0 = performance.now();
  gliding = true;
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / dur);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease in-out
    window.scrollTo({ top: from + d * e, behavior: "instant" });
    if (t < 1) glideRaf = requestAnimationFrame(tick);
    else {
      gliding = false;
      done?.();
    }
  };
  glideRaf = requestAnimationFrame(tick);
}

/** The page y where the hero shows raw position r (0–1).
 *  Measured against the pinned stage's own height (100svh), never window.innerHeight: on a phone
 *  innerHeight grows and shrinks as the address bar hides and shows, which would move "the end of
 *  layer 04" under the reader's finger and pull them back up out of "More work". */
export function heroY(r: number) {
  const el = document.getElementById("top");
  if (!el) return 0;
  const stage = el.firstElementChild as HTMLElement | null;
  const h = stage?.offsetHeight || window.innerHeight;
  return el.offsetTop + r * (el.offsetHeight - h);
}

export function scrollToRaw(r: number) {
  glideTo(heroY(r));
}

/** Go to layer i (0-based, in LAYERS order). */
export function goToLayer(i: number) {
  if (isFlow()) {
    if (i === 0) return glideTo(0);
    const el = document.querySelector<HTMLElement>(`[data-layer="${i}"]`);
    if (!el) return;
    // layers 02–04 leave room for the layer bar themselves; the sections below start a bit higher
    const top = el.getBoundingClientRect().top + window.scrollY - (i >= 4 ? 40 : 0);
    return glideTo(Math.max(0, top));
  }
  if (i < 4) return scrollToRaw(REST[i]);
  const id = (LAYERS[i] as { id?: string }).id;
  const el = id ? document.getElementById(id) : null;
  if (el) glideTo(el.getBoundingClientRect().top + window.scrollY);
}

/** Which layer the reader is in right now. */
export function currentLayer() {
  if (isFlow()) return flowLayer();
  const y = window.scrollY;
  for (let i = LAYERS.length - 1; i >= 4; i--) {
    const id = (LAYERS[i] as { id?: string }).id;
    const el = id ? document.getElementById(id) : null;
    if (el && el.offsetTop <= y + window.innerHeight * 0.4) return i;
  }
  const hero = document.getElementById("top");
  if (!hero) return 0;
  const raw = (y - hero.offsetTop) / Math.max(1, hero.offsetHeight - window.innerHeight);
  let i = 0;
  for (let k = 0; k < 4; k++) if (raw >= RAW_STOPS[k] - 0.001) i = k;
  return i;
}
