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
  { n: "01", name: "Surface", note: "Who I am" },
  { n: "02", name: "The Why", note: "How I think" },
  { n: "03", name: "Process", note: "How I work" },
  { n: "04", name: "Selected work", note: "The strongest projects" },
  { n: "05", name: "More work", note: "Earlier experiments", id: "work" },
  { n: "06", name: "What I do", note: "Services & tools", id: "services" },
  { n: "07", name: "Contact", note: "Let's talk", id: "contact" },
] as const;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── the glide: one eased trip between two resting points ── */
let glideRaf = 0;
let gliding = false;
export const isGliding = () => gliding;
/** stop a glide where it is (a finger took over) */
export function stopGlide() {
  cancelAnimationFrame(glideRaf);
  gliding = false;
}

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
  // short and responsive: it answers at once and only slows as it settles (ease-out) — the
  // remaining distance sets the time, so finishing a move the finger started is quick
  const dur = Math.min(850, 420 + (Math.abs(d) / window.innerHeight) * 300);
  const t0 = performance.now();
  gliding = true;
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3); // ease-out
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
  if (i < 4) return scrollToRaw(REST[i]);
  const id = (LAYERS[i] as { id?: string }).id;
  const el = id ? document.getElementById(id) : null;
  if (el) glideTo(el.getBoundingClientRect().top + window.scrollY);
}

/** Which layer the reader is in right now. */
export function currentLayer() {
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
