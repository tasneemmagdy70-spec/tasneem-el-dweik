"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * "Atom formation" intro timeline.
 *
 *  0  idle
 *  1  loading    — the atom assembles itself, 0 → 100%
 *  2  spark      — it collapses into a point of light at the nucleus
 *  3  burst      — shockwave, orbitals bloom, portrait is born from the light
 *  4  electrons  — orbits expand, skills are ejected onto them
 *  5  reveal     — copy arrives
 *  6  done       — idle interactions take over
 *
 * The full intro plays once per visit (browser session): it's the first impression. Coming
 * back in the same session — a reload, a return from a case study on Behance — gets a quick
 * ~1.5 s version: the portrait still blooms out of the light, but nobody waits for a loader
 * twice. A deliberate scroll, key press or the "Skip intro" button ends it at once.
 * Reduced-motion users get the end instantly.
 */
const SEEN = "ed-intro-seen";
export const STAGE = { idle: 0, loading: 1, spark: 2, burst: 3, electrons: 4, reveal: 5, done: 6 } as const;

/** How long the loader takes to reach 100%. */
export const LOAD_MS = 2800;

/** once per page load — rotating a tablet (crossing the breakpoint) must not replay it */
let played = false;

export function useIntro(isDesktop: boolean | null) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<number>(STAGE.idle);
  const [instant, setInstant] = useState(false);
  const [quick, setQuick] = useState(false);
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setInstant(true);
    setStage(STAGE.done);
  }, []);

  useEffect(() => {
    if (isDesktop === null) return; // wait until layout is known
    // the intro is the front door: a reload starts at the top, not wherever the page was left
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.scrollY > 0 && !location.hash) window.scrollTo(0, 0);

    if (reduce || played) {
      // Deferred so the state update isn't synchronous inside the effect.
      const t = window.setTimeout(finish, 0);
      return () => clearTimeout(t);
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {}
    // phones & tablets always get the short version: no loader to sit through, straight to the face
    if (!isDesktop) seen = true;
    const L = LOAD_MS;
    const plan: [number, number][] = seen
      ? [
          // quick: no loader — the spark, the bloom, the copy
          [STAGE.spark, 0],
          [STAGE.burst, 250],
          [STAGE.electrons, 700],
          [STAGE.reveal, 950],
          [STAGE.done, 1700],
        ]
      : [
          [STAGE.loading, 0],
          // paced so each beat registers: spark, the portrait unfolds, orbits & electrons, then the copy
          [STAGE.spark, L + 400],
          [STAGE.burst, L + 1000],
          [STAGE.electrons, L + 1800],
          [STAGE.reveal, L + (isDesktop ? 2600 : 2400)],
          [STAGE.done, L + (isDesktop ? 3900 : 3600)],
        ];
    if (seen) window.setTimeout(() => setQuick(true), 0);
    // marked as played from inside a timer, so React's dev double-run of effects (which clears
    // these timers) doesn't count as a play
    timers.current = plan.map(([s, t]) =>
      window.setTimeout(() => {
        // (marked from inside the timer — see `played` — so a dev double-run can't mark it early)
        if (!played) {
          try {
            sessionStorage.setItem(SEEN, "1");
          } catch {}
        }
        played = true;
        setStage(s);
      }, t),
    );

    const skip = () => finish();
    const opts = { once: true, passive: true } as const;
    const events = ["wheel", "touchmove", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, skip, opts));
    const t = window.setTimeout(() => events.forEach((e) => window.removeEventListener(e, skip)), L + 4200);

    return () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, skip));
    };
  }, [isDesktop, reduce, finish]);

  return { stage, instant, quick, skip: finish, reduce: !!reduce };
}

export function useIsDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}
