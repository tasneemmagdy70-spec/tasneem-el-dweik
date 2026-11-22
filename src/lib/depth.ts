import { FEATURED } from "./projects";

/**
 * The page as layers, top to bottom. The first four live inside the pinned hero
 * (#top) and are reached by scroll *depth*; the rest are ordinary sections.
 * Shared by the hero, the menu and every "go to" button so they always agree.
 */

/** Where each hero layer starts in the hero's scroll (0–1).
 *  Tuned for 5 featured projects: hero h-[818vh] → 718vh of scroll; 3×85vh, then ~88vh per project. */
export const RAW_STOPS = [0, 0.118, 0.237, 0.355, 1];

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

/** The core's own timeline inside the hero (see Hero: coreT = p .785 → .975). */
export function rawForCoreT(t: number) {
  return RAW_STOPS[3] + ((0.785 + t * 0.19 - 0.75) / 0.25) * (1 - RAW_STOPS[3]);
}
/** The middle of project i's hold on the stage. */
export function projectT(i: number) {
  return FEATURED.length > 1 ? Math.min(1, (i + 0.075) / (FEATURED.length - 1)) : 0;
}

export function scrollToRaw(r: number) {
  const el = document.getElementById("top");
  if (!el) return;
  const span = el.offsetHeight - window.innerHeight;
  window.scrollTo({ top: el.offsetTop + r * span, behavior: reduced() ? "auto" : "smooth" });
}

/** Go to layer i (0-based, in LAYERS order). Layer 3 lands on the first featured project. */
export function goToLayer(i: number) {
  if (i === 3) return scrollToRaw(rawForCoreT(projectT(0)));
  if (i < 3) return scrollToRaw(RAW_STOPS[i] + (i ? 0.03 : 0));
  const id = (LAYERS[i] as { id?: string }).id;
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
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
