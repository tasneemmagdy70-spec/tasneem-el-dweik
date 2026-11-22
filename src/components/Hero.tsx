"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import MagneticButton from "./MagneticButton";
import Nucleus from "./Nucleus";
import XRay from "./XRay";
import DepthParticles from "./DepthParticles";
import { DrawPath } from "./DrawStroke";
import { LOAD_MS, STAGE, useIntro, useIsDesktop } from "./useIntro";
import Loader from "./Loader";
import { FEATURED } from "@/lib/projects";
import { RAW_STOPS, goToLayer, projectT, rawForCoreT, scrollToRaw } from "@/lib/depth";
import { useTheme } from "@/lib/theme";
import ProjectOrbit, { coreStage } from "./ProjectOrbit";
import { CV_URL } from "@/lib/contact";

/* ───────────────────────────────────────────────────────────────
   BENEATH THE SURFACE
   The hero is one pinned scene. Scrolling = diving. Four chapters,
   each one layer deeper. The nucleus stays with you; its electrons
   carry each chapter's content.
   ─────────────────────────────────────────────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;
/** Where each layer starts in the physical scroll (the core gets the whole second half). */
// The first three layers keep ~85vh of scroll each; The Core gets ~90vh per project so a
// trackpad flick can't race past the work (and the scroll snaps to the nearest project).

const CHAPTERS = [
  {
    name: "Surface",
    depth: 0,
    electrons: [
      ["UX Research", "UI Design"],
      ["Prototyping", "Wireframing", "Usability Testing"],
      ["Figma", "Maze"],
    ],
  },
  {
    name: "The Why",
    depth: 120,
    electrons: [
      ["Curiosity", "Evidence"],
      ["Empathy", "Clarity", "Precision"],
      ["Patience", "Reason"],
    ],
  },
  {
    name: "Process",
    depth: 240,
    electrons: [
      ["Research", "Define"],
      ["Ideate", "Wireframe", "Prototype"],
      ["Test", "Iterate"],
    ],
  },
  {
    name: "Selected work",
    depth: 360,
    electrons: [
      ["NOVU", "Sana'a"],
      ["Khota", "Saknny"],
      ["Rooted", "+ more"],
    ],
  },
];

const LINES: { text: string; accent?: boolean }[][] = [
  [{ text: "Designing" }, { text: "for" }],
  [{ text: "the" }, { text: "why", accent: true }, { text: "behind" }],
  [{ text: "every" }, { text: "click." }],
];

// Shared chapter choreography: layers surface from below, blur → sharp.
const chapterV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -40, filter: "blur(10px)", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
};

/** Window size as [width, height]; [375, 812] on the server. */
function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
/** The *small* viewport height (100svh): what the pinned stage really has on a phone, even
 *  while the address bar is hidden and innerHeight is taller. */
let svhProbe: HTMLDivElement | null = null;
function smallVh() {
  if (!svhProbe) {
    svhProbe = document.createElement("div");
    svhProbe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
    document.body.appendChild(svhProbe);
  }
  return svhProbe.offsetHeight || window.innerHeight;
}
function useViewport(): [number, number] {
  const snap = useSyncExternalStore(
    subscribeResize,
    () => `${window.innerWidth}x${smallVh()}`,
    () => "375x812",
  );
  const [w, h] = snap.split("x").map(Number);
  return [w, h];
}

export default function Hero() {
  const desktop = useIsDesktop();
  const { stage, instant, quick, skip, reduce } = useIntro(desktop);
  const shown = stage >= STAGE.reveal;
  const done = stage >= STAGE.done;

  const section = useRef<HTMLElement>(null);
  const stage3d = useRef<HTMLDivElement>(null);
  const glideRef = useRef<HTMLDivElement>(null);

  /* ── scroll = depth ──────────────────────────────────────────── */
  const { scrollYProgress: raw } = useScroll({ target: section, offset: ["start start", "end end"] });
  // The first three layers each get ~10% of the scroll; The Core (the work, in orbit) gets the rest.
  // `p` keeps the four layers at 0–.25–.5–.75–1 so every layer's own timing stays simple.
  const p = useTransform(raw, RAW_STOPS, [0, 0.25, 0.5, 0.75, 1]);
  const [chapter, setChapter] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    setChapter(Math.min(3, Math.floor(v * 4 + 0.0001)));
  });

  const depthText = useTransform(p, (v) => `−${String(Math.round(v * 360)).padStart(3, "0")}m`);
  const surfaceLight = useTransform(p, [0, 0.75], [1, 0.12]);
  const abyss = useTransform(p, [0, 1], [0, 0.75]);
  const meterFill = useTransform(p, [0, 1], [0, 1]);

  /* ── mobile choreography (all scroll-linked, so it's reversible) ──
     One focal point per moment:
       1. first screen  — the ROLE (big) + the portrait, centred
       2. scrolling     — the role steps back into an eyebrow; the HEADLINE writes
                          itself in the top band; the portrait shrinks & docks right,
                          below it; the actions wait at the bottom (thumb zone)
       3. deeper layers — the portrait has done its job and dissolves; the atom
                          becomes a blurred backdrop and the CONTENT leads */
  const mobile = desktop === false;
  const sp = useTransform(p, [0, 0.25], [0, 1]);
  const [vw, vh] = useViewport();
  const B = Math.min(1.5 * vw, 0.74 * vh); // nucleus box — matches the CSS width below
  const TOP = 80 + 0.12 * vh; // nucleus box top — matches top-[calc(5rem+12svh)]
  const tablet = mobile && vw >= 640;
  // phone/tablet surface: the portrait stays as it is; scrolling just lifts the first screen
  // enough to bring the headline + actions (which sit right under the portrait) into view
  const S_DOCK = 1;
  const S_DEEP = 1.05;
  const S_CORE = 0.62;
  // the portrait's visible bottom (its feet dissolve into the orbitals) → where the headline starts
  // (+ a breath of space, so the line reads as the portrait's caption, not glued to it)
  const blockTop = TOP + 0.8 * B + (tablet ? 44 : 28);
  const [blockH, setBlockH] = useState(0);
  const reserve = vh - (tablet ? 96 : 84); // stay clear of the floating "Let's talk"
  const geo = {
    shift: 0,
    drop: -Math.max(0, blockTop + (blockH || (tablet ? 300 : 215)) - reserve),
    lift: 0.5 * vh - (TOP + 0.567 * B * S_DEEP), // deeper layers: the blurred atom sits dead centre
    coreLift: coreStage(vw, vh, true).fy - (TOP + 0.567 * B * S_CORE), // the core: the atom sits right behind the stage
  };
  // the core: the orbit arrives, then turns project by project
  const coreShow = useTransform(p, [0.75, 0.785], [0, 1]);
  const coreT = useTransform(p, [0.785, 0.975], [0, 1]);
  // deeper layers: each layer's own 0→1, so its content lights up item by item as you scroll
  const t1 = useTransform(p, [0.25, 0.42], [0, 1]);
  const t2 = useTransform(p, [0.5, 0.67], [0, 1]);
  const t3 = useTransform(p, [0.75, 0.92], [0, 1]);
  const shift = useMotionValue(0);
  const drop = useMotionValue(0);
  const lift = useMotionValue(0);
  const coreLift = useMotionValue(0);
  useEffect(() => {
    shift.set(geo.shift);
    drop.set(geo.drop);
    lift.set(geo.lift);
    coreLift.set(geo.coreLift);
  }, [geo.shift, geo.drop, geo.lift, geo.coreLift, shift, drop, lift, coreLift]);
  // dock during the surface → re-centre & blur for the middle layers → pulled forward, sharp, for the core
  const K = [0, 0.075, 0.235, 0.265, 0.74, 0.78];
  const mScale = useTransform(p, K, [1, S_DOCK, S_DOCK, S_DEEP, S_DEEP, S_CORE]);
  const mDock = useTransform(p, K, [0, 1, 1, 0, 0, 0]);
  const mDeep = useTransform(p, [K[2], K[3], K[4], K[5]], [0, 1, 1, 0]);
  const mCore = useTransform(p, [K[4], K[5]], [0, 1]);
  const mX = useTransform([mDock, shift], ([u, s]: number[]) => u * s);
  const mY = useTransform([mDock, drop, mDeep, lift, mCore, coreLift], ([d, dr, u, l, c, cl]: number[]) => d * dr + u * l + c * cl);
  const mBoost = useTransform(mScale, (s) => Math.min(1.5, 1 / s));
  const blockY = useTransform([mDock, drop], ([d, dr]: number[]) => d * dr);
  // the face belongs to the surface only
  const portrait = useTransform(p, [0.222, 0.255], [1, 0]);
  // the depth bar starts at "02 · The Why": the first screen and its headline are one moment
  const readoutIn = useTransform(p, [0.24, 0.27], [0, 1]);
  // deeper layers (mobile): the atom becomes atmosphere — blurred, dimmed, wordless
  // ("none" when sharp: a zero blur still costs a filter layer on every scroll frame of a phone)
  const mFilter = useTransform(mDeep, (d) => (d < 0.01 ? "none" : `blur(${(d * 12).toFixed(1)}px)`));
  // in daylight the blurred atom must step further back, or navy copy over royal blue loses contrast
  const theme = useTheme();
  const mFade = useTransform(mDeep, [0, 1], [1, theme === "light" ? 0.4 : 0.6]);
  // orbit words: full on the first screen, quiet once the headline & actions take focus, gone deeper
  const mWords = useTransform(p, [0, 0.075, 0.235, 0.25], [1, 0.4, 0.4, 0]);
  // desktop keeps its words through the middle layers; the core belongs to the projects
  const dWords = useTransform(p, [0.74, 0.77], [1, 0]);

  // one source of truth for "where is layer i" (lib/depth) — the menu, the depth meter and
  // every "next" button land in exactly the same place
  const goTo = goToLayer;
  const goToProject = (i: number) => scrollToRaw(rawForCoreT(projectT(i)));

  // Snap: in The Core, once scrolling settles, glide to the nearest project so you
  // always land on one — never stranded halfway between two.
  // Mouse / trackpad only. On touch, a JS glide fights the finger's momentum (it fires in the
  // pauses of a flick and drags the page back), so phones use the browser's own scroll-snap
  // instead — see the snap points rendered inside the section below.
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let timer = 0;
    const onScroll = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const v = p.get();
        if (v < 0.785 || v > 0.972) return;
        const n = FEATURED.length - 1;
        const t = (v - 0.785) / 0.19;
        const i = Math.max(0, Math.min(n, Math.round(t * n - 0.075)));
        const el = section.current;
        if (!el) return;
        const target = el.offsetTop + rawForCoreT(projectT(i)) * (el.offsetHeight - window.innerHeight);
        if (Math.abs(target - window.scrollY) > 6) window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
      }, 220); // long enough that a trackpad's momentum has really ended — never tug against a moving hand
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  /* ── desktop: where the atom must travel to sit centre-stage for the core ── */
  const nucWrap = useRef<HTMLDivElement>(null);
  const copyCol = useRef<HTMLDivElement>(null);
  const [desk, setDesk] = useState({ dx: 0, dy: 0, swap: 0 });
  useEffect(() => {
    const el = nucWrap.current;
    const st = stage3d.current;
    if (!el || !st) return;
    const ro = new ResizeObserver(() => {
      // layer 03 mirrors the layout: how far the atom and the copy each travel to trade sides
      const swap = copyCol.current ? copyCol.current.offsetLeft - el.offsetLeft : 0;
      const cx = el.offsetLeft + el.offsetWidth / 2;
      const cyBox = el.offsetTop + el.offsetHeight / 2;
      // atom's visual centre sits at 56.7% of the box; aim it at 44% of the stage height
      const atomY = cyBox + (0.567 - 0.5) * el.offsetHeight * 0.78;
      setDesk({ dx: st.clientWidth / 2 - cx, dy: coreStage(st.clientWidth, st.clientHeight, false).fy - atomY, swap });
    });
    ro.observe(st);
    return () => ro.disconnect();
  }, [desktop]);

  /* ── intro glide (desktop): atom forms at screen centre, then moves aside ── */
  const glideX = useMotionValue(0);
  useLayoutEffect(() => {
    if (!desktop || instant || stage >= STAGE.reveal || !glideRef.current) return;
    const r = glideRef.current.getBoundingClientRect();
    glideX.set(window.innerWidth / 2 - (r.left + r.width / 2) - glideX.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktop]);
  useEffect(() => {
    if (instant) {
      glideX.set(0);
      return;
    }
    if (stage >= STAGE.reveal) {
      const c = animate(glideX, 0, { duration: 1.5, ease });
      return () => c.stop();
    }
  }, [stage, instant, glideX]);

  // Desktop: the atom breathes per chapter, then glides centre-stage for the core.
  // (surface: the portrait rises above the orbits, so the box sits a little lower to
  // centre what the eye actually sees — face to arms — against the headline.
  //  layer 03: the atom crosses to the left and the copy to the right — a visible turn of the page.)
  const nucleusPose = [
    { scale: 1, x: 0, y: Math.round(0.05 * vh) },
    { scale: 1.06, x: 0, y: 0 },
    { scale: 0.94, x: desk.swap, y: -6 },
    { scale: 0.78, x: desk.dx, y: desk.dy },
  ][chapter];

  const next = CHAPTERS[chapter + 1]?.name;

  return (
    <section ref={section} id="top" className="relative h-[818vh]">
      {/* touch: one native snap point per featured project (only active where html has
          scroll-snap-type, i.e. coarse pointers — see globals.css). Each sits where that
          project is centre-stage: raw × (section height − viewport height). */}
      {FEATURED.map((_, i) => {
        const r = rawForCoreT(projectT(i));
        return (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute left-0 h-px w-px [scroll-snap-align:start] [scroll-snap-stop:normal]"
            style={{ top: `calc(${(r * 100).toFixed(3)}% - ${r.toFixed(4)} * 100dvh)` }}
          />
        );
      })}
      <div ref={stage3d} className="sticky top-0 isolate h-[100svh] overflow-hidden">
        {/* ── the water column ── */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-paper">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-12%,rgb(var(--rgb-bright)/0.38),transparent_70%)]"
            style={{ opacity: surfaceLight }}
          />
          <motion.div className="absolute inset-0 bg-abyss" style={{ opacity: abyss }} />
          <div className="absolute inset-0 bg-[radial-gradient(rgb(var(--rgb-glow)/var(--dots-a))_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_50%,black,transparent)]" />
          <DepthParticles progress={p} reduce={reduce} />
        </div>

        <div className="mx-auto h-full w-full max-w-6xl lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:items-center lg:gap-4 lg:px-8 lg:pb-[clamp(4rem,12svh,5rem)] lg:pt-[clamp(4.25rem,11svh,5.5rem)]">
          {/* ── chapter copy ── */}
          {mobile ? (
            <MobileCopy
              chapter={chapter}
              shown={shown}
              instant={instant}
              chapterT={[sp, t1, t2, t3][chapter]}
              blockTop={blockTop}
              blockY={blockY}
              onBlockSize={setBlockH}
              onNext={() => goTo(chapter + 1)}
            />
          ) : (
            <div ref={copyCol} className="relative z-10 lg:order-1">
              <AnimatePresence mode="wait" initial={false}>
                {chapter === 0 && <SurfaceChapter key="c0" shown={shown} instant={instant} desktop={!!desktop} done={done} reduce={reduce} />}
                {chapter > 0 && chapter < 3 && <DeepChapter key={`c${chapter}`} i={chapter} x={chapter === 2 ? -desk.swap : 0} />}
              </AnimatePresence>
            </div>
          )}

          {/* ── nucleus ── */}
          <motion.div
            ref={nucWrap}
            className="absolute left-[calc(50vw-min(75vw,37svh))] top-[calc(5rem+12svh)] z-10 w-[min(150vw,74svh)] lg:relative lg:left-auto lg:top-auto lg:order-2 lg:mx-auto lg:w-full lg:max-w-[620px]"
            style={mobile ? { originY: 0, x: mX, y: mY, scale: mScale, filter: mFilter, opacity: mFade } : { originY: 0.5 }}
            // desktop only — while the breakpoint is still unknown, animating x/y here would take
            // ownership of them and the mobile dock (style x/y) would never move the atom
            animate={desktop ? nucleusPose : undefined}
            transition={{ duration: 1.1, ease }}
          >
            <motion.div ref={glideRef} style={{ x: glideX }} className="relative">
              <div
                data-xray-label="Trust"
                data-xray-note="Eye contact builds trust before a word is read. The orbits are my skills — closest = deepest."
                className="absolute inset-[18%]"
              />
              <Nucleus
                stage={stage}
                instant={instant}
                reduce={reduce}
                compact={desktop === false}
                labels={CHAPTERS[chapter].electrons}
                labelBoost={mobile ? mBoost : 1}
                portrait={portrait}
                words={mobile ? mWords : dWords}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ── the core: the work, in orbit around the atom ── */}
        {desktop !== null && (
          <ProjectOrbit progress={coreT} show={coreShow} enabled={chapter === 3} mobile={mobile} vw={vw} vh={vh} onPick={goToProject} onAll={() => goTo(4)} />
        )}

        {/* ── depth meter (desktop) ── */}
        <motion.nav
          aria-label="Depth"
          initial={false}
          animate={{ opacity: done ? 1 : 0, x: done ? 0 : 20 }}
          transition={{ duration: 0.8, ease }}
          className="absolute right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex lg:right-8"
        >
          <div className="text-right font-mono">
            <div className="text-[9px] uppercase tracking-[0.3em] text-ink-soft">Depth</div>
            <motion.div className="text-[15px] tabular-nums text-blue-glow">{depthText}</motion.div>
          </div>
          <div className="relative flex flex-col items-end gap-7 pr-3">
            <span className="absolute right-0 top-1 h-[calc(100%-8px)] w-px bg-white/10" />
            <motion.span className="absolute right-0 top-1 h-[calc(100%-8px)] w-px origin-top bg-blue-glow" style={{ scaleY: meterFill }} />
            {CHAPTERS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => goTo(i)}
                className="group relative flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]"
                aria-current={chapter === i ? "step" : undefined}
              >
                <span className={`transition-all duration-500 ${chapter === i ? "text-ink" : "text-ink-soft group-hover:text-ink"}`}>{c.name}</span>
                <span
                  className={`absolute -right-[15.5px] size-[7px] rounded-full border transition-all duration-500 ${chapter === i ? "scale-125 border-blue-glow bg-blue-glow shadow-[0_0_12px_rgb(var(--rgb-glow)/0.9)]" : "border-white/30 bg-paper"}`}
                />
              </button>
            ))}
          </div>
        </motion.nav>

        {/* ── depth readout (mobile) — hidden on the first screen so it stays calm ── */}
        <motion.div initial={false} animate={{ opacity: done ? 1 : 0 }} className="absolute inset-x-6 top-[4.5rem] z-40 sm:inset-x-8 lg:hidden">
          <motion.div style={{ opacity: readoutIn }} className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft">
            <span className="text-blue-glow">0{chapter + 1}</span>
            <span className="text-ink">{CHAPTERS[chapter].name}</span>
            <span className="relative h-px flex-1 bg-white/10">
              <motion.span className="absolute inset-0 origin-left bg-blue-glow" style={{ scaleX: meterFill }} />
            </span>
            <motion.span className="tabular-nums text-blue-glow">{depthText}</motion.span>
          </motion.div>
        </motion.div>

        {/* ── next-layer cue ── */}
        <motion.button
          type="button"
          onClick={() => goTo(chapter + 1)}
          initial={false}
          animate={{ opacity: done && chapter < 3 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          style={{ pointerEvents: chapter < 3 ? "auto" : "none" }}
          className="absolute bottom-[clamp(0.75rem,2.5svh,1.5rem)] left-1/2 z-40 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft transition-colors hover:text-ink lg:flex"
        >
          <span>
            Scroll to dive <span className="text-ink-soft/40">·</span> next: <span className="text-blue-glow">{next ?? "More work"}</span>
          </span>
          <span className="relative h-[clamp(1.25rem,4svh,2.25rem)] w-px overflow-hidden bg-white/10">
            {!reduce && (
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-blue-glow"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </span>
        </motion.button>

        {/* ── for screen readers: the whole story, always ──
            The pinned layers only render the one you have scrolled to, so a screen reader would
            never reach The Why or Process. This copy holds every layer that isn't on screen
            (the visible one is read where it is, so nothing is announced twice). */}
        <div className="sr-only">
          {chapter !== 0 && <h1>Tasneem El-Dweik, UI/UX &amp; Product Designer. Designing for the why behind every click.</h1>}
          {[1, 2]
            .filter((i) => i !== chapter)
            .map((i) => {
              const Body = BODIES[i];
              return (
                <section key={i} aria-label={HEADS[i].name}>
                  <h2>{HEADS[i].title}</h2>
                  <Body />
                </section>
              );
            })}
        </div>

        {/* ── the signature: x-ray lens over the surface ── */}
        {/* (desktop only: a lens needs a hovering cursor; on touch it was just another button) */}
        <XRay container={stage3d} enabled={!mobile && chapter === 0 && done && !reduce} />
      </div>

      <Loader visible={stage < STAGE.spark && !instant} running={stage === STAGE.loading} duration={LOAD_MS} instant={instant || quick} onSkip={skip} />
    </section>
  );
}

/* ═════════════════════════ chapters ═════════════════════════ */

function SurfaceChapter({ shown, instant, desktop, done, reduce }: { shown: boolean; instant: boolean; desktop: boolean; done: boolean; reduce: boolean }) {
  // First visit: copy slides out from beside the nucleus. Returning from deeper: rises like the other layers.
  const from = desktop ? { opacity: 0, x: 70, y: 0 } : { opacity: 0, x: 0, y: 24 };
  const to = { opacity: 1, x: 0, y: 0 };
  const tr = (delay: number, duration = 0.9) => ({ duration: instant ? 0.4 : duration, delay: instant ? delay * 0.3 : delay, ease });
  let w = 0;

  return (
    <motion.div variants={{ exit: chapterV.exit }} exit="exit">
      {/* Who, in one quiet line. The story lives one layer down (The Why). */}
      <motion.p
        initial={from}
        animate={shown ? to : from}
        transition={tr(0)}
        className="mb-3 flex w-fit items-center gap-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-blue-glow [text-shadow:0_1px_10px_var(--color-paper),0_0_4px_var(--color-paper)] lg:mb-6 lg:text-[11px] lg:text-ink-soft"
        data-xray-label="Name tag"
        data-xray-note="Name + role, nothing else. The headline does the talking."
      >
        <span className="text-ink">Tasneem El-Dweik</span>
        <span className="h-px w-6 bg-blue-glow/60" />
        UI/UX &amp; Product Designer
      </motion.p>

      <h1
        className="w-fit font-serif text-[clamp(2.6rem,6.6vw,6.2rem)] leading-[0.96] tracking-[-0.02em] text-ink [text-shadow:0_2px_18px_rgb(var(--rgb-halo)/0.85)] lg:[text-shadow:none]"
        data-xray-label="H1 · one idea"
        data-xray-note="Instrument Serif at display size: editorial, calm, confident. One sentence, one promise."
      >
        <span className="sr-only">Designing for the why behind every click.</span>
        <span aria-hidden className="block">
          {LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((word) => {
                const i = w++;
                return (
                  <span key={word.text} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                    <motion.span
                      className={`relative inline-block ${word.accent ? "italic text-blue-glow" : ""}`}
                      initial={{ y: "105%" }}
                      animate={{ y: shown ? 0 : "105%" }}
                      transition={tr(0.08 + i * 0.06, 1)}
                      {...(word.accent
                        ? {
                            "data-xray-label": "Accent",
                            "data-xray-note": "The only italic, the only color in the headline — that's where your eye lands.",
                          }
                        : {})}
                    >
                      {word.text}
                      {word.accent && (
                        <svg viewBox="0 0 120 14" preserveAspectRatio="none" className="absolute -bottom-[0.02em] left-0 h-[0.16em] w-full overflow-visible">
                          <DrawPath
                            d="M2 9 C 30 3, 70 3, 118 7"
                            fill="none"
                            stroke="var(--color-sand)"
                            strokeWidth={4}
                            strokeLinecap="round"
                            play={shown}
                            instant={instant}
                            duration={0.9}
                            delay={0.75}
                          />
                        </svg>
                      )}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      </h1>

      <motion.div initial={from} animate={shown ? to : from} transition={tr(0.55)} className="mt-6 flex flex-wrap items-center gap-2 lg:mt-10 lg:gap-3">
        <span
          className="inline-flex"
          data-xray-label="Primary action"
          data-xray-note="Highest contrast on the page, and it leans toward your cursor — the one thing I want you to do."
        >
          <MagneticButton
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              goToLayer(3);
            }}
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-cta hover:bg-cta-hover py-1.5 pl-4 pr-1.5 text-[0.8rem] lg:gap-3 font-medium text-on-cta shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-300 lg:py-3.5 lg:pl-6 lg:pr-3.5 lg:text-[0.95rem]"
          >
            <span className="relative">View My Work</span>
            <span className="relative grid size-7 place-items-center lg:size-8 rounded-full bg-on-cta text-blue transition-transform duration-500 ease-out-expo group-hover:scale-105">
              <span className="relative block size-4 overflow-hidden">
                <Arrow className="absolute inset-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-full" />
                <Arrow className="absolute inset-0 -translate-x-full transition-transform duration-500 ease-out-expo group-hover:translate-x-0" />
              </span>
            </span>
          </MagneticButton>
        </span>

        <a
          href={CV_URL}
          download
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-2 text-[0.8rem] font-medium text-ink backdrop-blur transition-colors duration-300 hover:border-blue-glow/60 hover:text-blue-glow lg:px-6 lg:py-3.5 lg:text-[0.95rem]"
          data-xray-label="Secondary action"
          data-xray-note="A recruiter's second need. Quieter than the primary, but never hidden."
        >
          Download CV
          <svg
            viewBox="0 0 16 16"
            className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
          >
            <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </motion.div>

      {/* invitation to the x-ray */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 1, delay: instant ? 0 : 0.3 }}
        className="mt-8 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft lg:flex"
      >
        <span className="relative grid size-4 place-items-center">
          {!reduce && <span className="absolute inset-0 animate-ping rounded-full border border-blue-glow/50" />}
          <span className="size-1.5 rounded-full bg-blue-glow" />
        </span>
        Your cursor is an x-ray — hover anything to see why
      </motion.p>
    </motion.div>
  );
}

/* ═════════════ mobile ═════════════
   Nothing sits on top of anything:
     top    — what to read (role first, then the headline)
     middle — the portrait on the right, the actions beside it on the left
     under  — a ghost of what's next, so the eye knows where the scroll leads
   Deeper layers drop the portrait; the atom blurs into atmosphere. Every
   layer's content is visible at once but "disabled", and lights up item by item
   as you scroll — you never have to finish a layer to see what's coming. */

function MobileCopy({
  chapter,
  shown,
  instant,
  chapterT,
  blockTop,
  blockY,
  onBlockSize,
  onNext,
}: {
  chapter: number;
  shown: boolean;
  instant: boolean;
  chapterT: MotionValue<number>;
  blockTop: number;
  blockY: MotionValue<number>;
  onBlockSize: (h: number) => void;
  onNext: () => void;
}) {
  const head = HEADS[chapter];
  const Body = BODIES[chapter];
  // the deeper layers must fit between the depth bar and the floating button on every phone —
  // including phones with a larger system font, where the copy grows taller than the space
  const [deepBox, setDeepBox] = useState<HTMLDivElement | null>(null);
  const [deepCopy, setDeepCopy] = useState<HTMLDivElement | null>(null);
  const fit = useFitZoom(deepBox, deepCopy);
  // the role rides up with the rest of the first page (one piece, one scroll),
  // fading only as it slides under the top bar
  const roleY = blockY;
  const roleOut = useTransform(blockY, (y) => Math.min(1, Math.max(0, 1 + (y + 8) / 44)));

  return (
    <>
      {/* ── first screen: the role is the headline ── */}
      <AnimatePresence>
        {chapter === 0 && (
          <motion.div
            key="role"
            className="pointer-events-none absolute inset-x-6 top-[calc(4.75rem+1.5svh)] z-20 text-center sm:inset-x-8"
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 18, filter: "blur(8px)" }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: instant ? 0.4 : 1, delay: instant ? 0 : 0.15, ease }}
          >
            <motion.div style={{ opacity: roleOut, y: roleY }}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft sm:mb-3 sm:text-[11.5px]">Tasneem El-Dweik</p>
              <p className="font-serif text-[clamp(2.3rem,5.6svh,3rem)] leading-[1] tracking-[-0.02em] text-ink sm:text-[clamp(3rem,6.2svh,4.25rem)] [text-shadow:0_2px_16px_rgb(var(--rgb-halo)/0.9)]">
                UI/UX <span className="text-[0.7em] text-ink-soft">&amp;</span> Product
                <br />
                <span className="italic text-blue-glow">Designer</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── surface ── */}
      <AnimatePresence>
        {chapter === 0 && (
          <SurfaceHeadline key="headline" shown={shown} instant={instant} top={blockTop} y={blockY} onSize={onBlockSize} onNext={onNext} />
        )}
      </AnimatePresence>
      {/* ── deeper layers: content first; everything visible, lighting up as you scroll ── */}
      <div className="pointer-events-none absolute inset-x-6 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+5.25rem)] top-[calc(5.5rem+1svh)] z-20 flex flex-col justify-[safe_center] sm:inset-x-8 sm:bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+6.25rem)]"
        ref={setDeepBox}
      >
        <AnimatePresence mode="wait">
          {chapter > 0 && chapter < 3 && (
            <motion.div
              key={`deep${chapter}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
              exit={{ opacity: 0, y: -24, filter: "blur(8px)", transition: { duration: 0.3 } }}
              className="pointer-events-auto [text-shadow:0_1px_12px_rgb(var(--rgb-halo)/0.9)]"
            >
              <div ref={setDeepCopy} style={{ zoom: fit }}>
              <RevealCtx.Provider value={chapterT}>
                <RItem i={0}>
                  <h2 className="font-serif text-[clamp(2.3rem,5.6svh,2.9rem)] leading-[1] tracking-[-0.02em] text-ink sm:text-[clamp(3rem,6svh,4.25rem)]">
                    {head.title}
                  </h2>
                </RItem>
                <div className="mt-[max(3svh,1.25rem)]">
                  <Body />
                </div>
              </RevealCtx.Provider>
              <Teaser chapter={chapter} onNext={onNext} className="mt-[max(4.5svh,2rem)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/**
 * Shrinks `content` (CSS zoom, which scales layout too, so centring stays true) just enough to
 * fit inside `box`. 1 when it already fits; never below 0.72, so text stays readable — past that
 * the box's safe centring lets it run on downward instead of over the header.
 */
function useFitZoom(box: HTMLElement | null, content: HTMLElement | null) {
  const [zoom, setZoom] = useState(1);
  const current = useRef(1);
  useLayoutEffect(() => {
    if (!box || !content) return;
    const measure = () => {
      // the rendered height includes the zoom in use, so divide it back out for the natural height
      const natural = content.getBoundingClientRect().height / current.current;
      if (!natural) return;
      const next = Math.max(0.72, Math.min(1, (box.clientHeight - 4) / natural));
      if (Math.abs(next - current.current) > 0.01) {
        current.current = next;
        setZoom(next);
      }
    };
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(content);
    measure();
    return () => ro.disconnect();
  }, [box, content]);
  return zoom;
}

/* ── scroll-linked reveal (mobile) / variant reveal (desktop), one component ── */

const RevealCtx = createContext<MotionValue<number> | null>(null);
type RItemProps = { i: number; as?: "div" | "li"; className?: string; children: ReactNode };

/** An item that, on mobile, sits "disabled" until the scroll reaches its turn. */
function RItem(props: RItemProps) {
  const t = useContext(RevealCtx);
  return t ? <ScrollItem {...props} t={t} /> : <VariantItem {...props} />;
}

function VariantItem({ as = "div", className, children }: RItemProps) {
  return as === "li" ? (
    <motion.li variants={itemV} className={className}>
      {children}
    </motion.li>
  ) : (
    <motion.div variants={itemV} className={className}>
      {children}
    </motion.div>
  );
}

function ScrollItem({ t, i, as = "div", className, children }: RItemProps & { t: MotionValue<number> }) {
  const at = i * 0.12;
  const opacity = useTransform(t, [at, at + 0.2], [0.16, 1]);
  const y = useTransform(t, [at, at + 0.2], [10, 0]);
  const blur = useTransform(t, [at, at + 0.2], [3, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const style = { opacity, y, filter };
  return as === "li" ? (
    <motion.li style={style} className={className}>
      {children}
    </motion.li>
  ) : (
    <motion.div style={style} className={className}>
      {children}
    </motion.div>
  );
}

/** A ghost of the next layer: the eye knows what's coming before the thumb gets there. */
function Teaser({ chapter, onNext, className = "", large = false }: { chapter: number; onNext: () => void; className?: string; large?: boolean }) {
  const n = chapter === 3 ? { n: "05", name: "More work", title: <>Earlier experiments.</> } : HEADS[chapter + 1];
  return (
    <button type="button" onClick={onNext} className={`group block w-full text-left ${className}`} aria-label={`Next: ${n.name}`}>
      <span className="mb-2 flex items-center gap-2.5 font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-soft sm:text-[11px]">
        <span className="text-blue-glow">Next ↓</span>
        <span className="h-px w-6 bg-white/20" />
        {n.n} · {n.name}
      </span>
      <span
        className={`block font-serif tracking-[-0.01em] text-ink opacity-[0.26] transition-opacity group-active:opacity-60 ${
          large
            ? "text-[clamp(2.1rem,5svh,2.6rem)] leading-[1] sm:text-[clamp(2.75rem,5svh,3.5rem)]"
            : "text-[clamp(1.45rem,3.3svh,1.8rem)] leading-[1.05] sm:text-[clamp(2rem,3.3svh,2.5rem)]"
        }`}
      >
        {n.title}
      </span>
    </button>
  );
}

/**
 * Phone & tablet: the first page continues under the portrait — the promise in
 * one line (only "why" is loud), the two actions side by side, and only then the
 * invitation to scroll. It's all there from the start and moves as one page.
 */
function SurfaceHeadline({
  shown,
  instant,
  top,
  y,
  onSize,
  onNext,
}: {
  shown: boolean;
  instant: boolean;
  top: number;
  y: MotionValue<number>;
  onSize: (h: number) => void;
  onNext: () => void;
}) {
  // report the block's height, so the first page lifts exactly enough to show all of it
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onSize(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [onSize]);

  const enter = (i: number) => ({
    initial: { opacity: 0, y: 14, filter: "blur(8px)" },
    animate: shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(8px)" },
    transition: { duration: instant ? 0.3 : 0.9, delay: instant ? 0 : 0.35 + i * 0.15, ease },
  });

  return (
    <motion.div
      ref={ref}
      exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.35 } }}
      className="pointer-events-none absolute inset-x-5 z-20 text-center sm:inset-x-8"
      style={{ top, y }}
    >
      <motion.h1
        {...enter(0)}
        className="font-serif text-[clamp(1.12rem,4.9vw,1.4rem)] leading-tight tracking-[-0.01em] text-ink [text-shadow:0_2px_14px_rgb(var(--rgb-halo)/0.9)] sm:text-[clamp(1.6rem,3.7vw,2.3rem)]"
        data-xray-label="H1 · one idea"
        data-xray-note="The sentence stays quiet so one word can be loud: why."
      >
        Designing for the{" "}
        <span className="relative mx-[0.06em] inline-block align-[-0.12em] text-[1.75em] italic leading-none text-blue-glow">
          why
          <svg viewBox="0 0 120 14" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-0 h-[0.12em] w-full overflow-visible" aria-hidden>
            <DrawPath
              d="M2 9 C 30 3, 70 3, 118 7"
              fill="none"
              stroke="var(--color-sand)"
              strokeWidth={4}
              strokeLinecap="round"
              play={shown}
              instant={instant}
              duration={0.9}
            />
          </svg>
        </span>{" "}
        behind every click.
      </motion.h1>

      {/* the two actions, side by side, right under the promise */}
      <motion.div {...enter(1)} className="pointer-events-auto mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7 sm:gap-3">
        <MagneticButton
          href="#work"
          onClick={(e) => {
            e.preventDefault();
            goToLayer(3);
          }}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-cta hover:bg-cta-hover py-1.5 pl-4 pr-1.5 text-[0.8rem] font-medium text-on-cta shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:py-2 sm:pl-5 sm:pr-2 sm:text-[1rem]"
        >
          <span className="relative">View My Work</span>
          <span className="relative grid size-7 place-items-center rounded-full bg-on-cta text-blue sm:size-9">
            <Arrow className="size-3.5" />
          </span>
        </MagneticButton>
        <a
          href={CV_URL}
          download
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[0.8rem] font-medium text-ink backdrop-blur transition-colors active:border-blue-glow active:text-blue-glow sm:px-5 sm:py-3 sm:text-[1rem]"
        >
          Download CV
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </motion.div>

      {/* only now: the invitation to dive into layer 02 */}
      <motion.button
        {...enter(2)}
        type="button"
        onClick={onNext}
        className="pointer-events-auto mx-auto mt-7 flex flex-col items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.28em] text-ink-soft sm:mt-9 sm:text-[11px]"
      >
        Scroll to read
        <span className="relative h-6 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-blue-glow"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.button>
    </motion.div>
  );
}
/* ═════════════ deeper layers: shared by desktop and mobile ═════════════ */

const HEADS: Record<number, { n: string; name: string; title: ReactNode }> = {
  1: {
    n: "02",
    name: "The Why",
    title: (
      <>
        Every surface
        <br />
        hides a <span className="italic text-blue-glow">reason</span>.
      </>
    ),
  },
  2: {
    n: "03",
    name: "Process",
    title: (
      <>
        Layers, not
        <br />
        <span className="italic text-blue-glow">guesses</span>.
      </>
    ),
  },
  3: {
    n: "04",
    name: "Selected work",
    title: (
      <>
        Work in
        <br />
        <span className="italic text-blue-glow">orbit</span>.
      </>
    ),
  },
};

function ChapterLabel({ n, name, center = false }: { n: string; name: string; center?: boolean }) {
  return (
    <motion.div
      variants={itemV}
      className={`mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-blue-glow lg:mb-[clamp(0.6rem,2.2svh,1.5rem)] ${center ? "justify-center" : ""}`}
    >
      <span>{n}</span>
      <span className="h-px w-8 bg-blue-glow/50" />
      <span className="text-ink-soft">{name}</span>
    </motion.div>
  );
}

/** Desktop: label + heading + body in the left column. */
function DeepChapter({ i, x = 0 }: { i: number; x?: number }) {
  const head = HEADS[i];
  const Body = BODIES[i];
  return (
    <motion.div variants={chapterV} initial="hidden" animate="show" exit="exit" style={{ x }}>
      <ChapterLabel n={head.n} name={head.name} />
      <motion.h2 variants={itemV} className="font-serif text-[clamp(2rem,min(5.6vw,7.2svh),5.2rem)] leading-[1] tracking-[-0.02em] text-ink">
        {head.title}
      </motion.h2>
      <div className="mt-[clamp(0.85rem,3svh,2rem)]">
        <Body />
      </div>
    </motion.div>
  );
}

/** Where the "why" was learned: the credentials, as proof rather than decoration. */
const CREDENTIALS = [
  ["ITI", "UI/UX Design", "Information Technology Institute"],
  ["NTI", "UI/UX Design", "National Telecommunication Institute"],
  ["Lab", "Chemistry", "Where asking “why” started"],
];

function WhyBody() {
  return (
    <div>
      <RItem i={1}>
        <p className="max-w-[34rem] text-[0.98rem] leading-[1.65] text-ink-soft sm:text-[1.15rem] lg:text-[clamp(0.92rem,2.2svh,1.08rem)] lg:leading-[1.6]">
          <span className="text-ink">ITI &amp; NTI graduate</span>, UI/UX designer — and a chemist before that. Chemistry taught me never to take a surface at
          face value; design is where I use it.{" "}
          <span className="text-ink">I research before I draw, and every color, word and click has to earn its place.</span>
        </p>
      </RItem>
      <ul className="mt-6 max-w-[34rem] lg:mt-[clamp(0.9rem,3.2svh,2.25rem)]">
        {CREDENTIALS.map(([tag, what, where], i) => (
          <RItem
            key={tag}
            i={i + 2}
            as="li"
            className="grid grid-cols-[3.25rem_1fr] items-baseline gap-x-3 border-t border-white/[0.08] py-2.5 last:border-b lg:grid-cols-[4rem_1fr] lg:py-[clamp(0.35rem,1.3svh,0.75rem)]"
          >
            <span className={`font-mono text-[11px] font-semibold tracking-[0.14em] ${i < 2 ? "text-blue-glow" : "text-sand"}`}>{tag}</span>
            <span>
              <span className="block text-[0.95rem] font-medium text-ink sm:text-[1.1rem]">
                {what} {i < 2 && <span className="font-normal text-ink-soft">· Graduate</span>}
              </span>
              <span className="block text-[0.8rem] text-ink-soft sm:text-[0.95rem]">{where}</span>
            </span>
          </RItem>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  ["Research", "Talk to people before drawing a single box."],
  ["Define", "Turn what I heard into one clear problem."],
  ["Ideate & Wireframe", "Many rough paths — then the right one."],
  ["Prototype", "Make it real enough to test."],
  ["Test & Iterate", "Let users prove me wrong, then fix it."],
];

/**
 * The process as a connected path: a line grows from step to step (with the
 * scroll on mobile, on its own on desktop), each step lights up as the line
 * reaches it, and once it hits "Test & Iterate" a curve loops back to the start —
 * because the process never really ends, it goes round again.
 */
function ProcessBody() {
  const ctx = useContext(RevealCtx);
  const auto = useMotionValue(0);
  useEffect(() => {
    if (ctx) return;
    const c = animate(auto, 1, { duration: 2.8, delay: 0.5, ease: "easeInOut" });
    return () => c.stop();
  }, [ctx, auto]);
  const base = ctx ?? auto;
  const line = useTransform(base, ctx ? [0.06, 0.7] : [0, 0.8], [0, 1]);
  const loop = useTransform(base, ctx ? [0.72, 0.9] : [0.82, 1], [0, 1]);
  const arrowIn = useTransform(loop, [0.85, 1], [0, 1]);
  // the loop draws itself using its measured length (Motion's pathLength renders dotted here)
  const loopPath = useRef<SVGPathElement>(null);
  const loopLen = useRef(0);
  const drawLoop = (v: number) => {
    const el = loopPath.current;
    if (el) el.style.strokeDashoffset = String(loopLen.current * (1 - v));
  };
  useMotionValueEvent(loop, "change", drawLoop);

  // node centres, measured with offsets (immune to the reveal transforms)
  const list = useRef<HTMLOListElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const [ys, setYs] = useState<number[]>([]);
  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const measure = () =>
      setYs(
        nodes.current.map((n) => {
          const li = n?.parentElement;
          return n && li ? li.offsetTop + n.offsetTop + n.offsetHeight / 2 : 0;
        }),
      );
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = loopPath.current;
    if (!el) return;
    loopLen.current = el.getTotalLength();
    el.style.strokeDasharray = String(loopLen.current);
    drawLoop(loop.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ys]);

  const ready = ys.length === STEPS.length && ys[ys.length - 1] > ys[0];
  const y0 = ready ? ys[0] : 0;
  const yN = ready ? ys[ys.length - 1] : 1;
  const frac = (i: number) => (ready ? (ys[i] - y0) / (yN - y0) : i / (STEPS.length - 1));

  return (
    <ol ref={list} className="relative max-w-[32rem]">
      {ready && (
        <>
          {/* the track, and the line that grows along it */}
          <span aria-hidden className="absolute left-[15px] w-px bg-white/12" style={{ top: y0, height: yN - y0 }} />
          <motion.span
            aria-hidden
            className="absolute left-[15px] w-px origin-top bg-linear-to-b from-blue-glow via-blue-bright to-sand shadow-[0_0_6px_rgb(var(--rgb-glow)/0.3)]"
            style={{ top: y0, height: yN - y0, scaleY: line }}
          />
          {/* iterate: the loop back to the start */}
          <svg aria-hidden className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
            <path
              ref={loopPath}
              d={`M 1 ${yN} C -26 ${yN - 10}, -26 ${y0 + 10}, 1 ${y0}`}
              fill="none"
              stroke="var(--color-sand)"
              strokeWidth={1.2}
              strokeLinecap="round"
              opacity={0.85}
            />
            <motion.path
              d={`M -4 ${y0 - 4} L 1 ${y0} L -4 ${y0 + 4}`}
              fill="none"
              stroke="var(--color-sand)"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: arrowIn }}
            />
          </svg>
          <motion.span aria-hidden className="absolute -left-[22px] font-mono text-[11px] text-sand" style={{ top: (y0 + yN) / 2 - 8, opacity: arrowIn }}>
            ↺
          </motion.span>
        </>
      )}
      {STEPS.map(([t, d], i) => (
        <ProcessStep
          key={t}
          n={i + 1}
          title={t}
          desc={d}
          line={line}
          at={frac(i)}
          last={i === STEPS.length - 1}
          nodeRef={(el) => void (nodes.current[i] = el)}
        />
      ))}
    </ol>
  );
}

function ProcessStep({
  n,
  title,
  desc,
  line,
  at,
  last,
  nodeRef,
}: {
  n: number;
  title: string;
  desc: string;
  line: MotionValue<number>;
  at: number;
  last: boolean;
  nodeRef: (el: HTMLSpanElement | null) => void;
}) {
  // lights the moment the line arrives (the last step must finish exactly at the line's end)
  const lit = useTransform(line, [Math.max(0, at - 0.04), Math.max(0.001, at)], [0, 1]);
  const text = useTransform(line, [Math.max(0, at - 0.1), Math.max(0.001, at)], [0.2, 1]);
  const x = useTransform(line, [Math.max(0, at - 0.1), Math.max(0.001, at)], [-6, 0]);
  return (
    <li className="relative grid grid-cols-[30px_1fr] gap-x-4 pb-[max(2.2svh,1rem)] last:pb-0 lg:pb-[clamp(0.55rem,2svh,1.4rem)]">
      <span
        ref={nodeRef}
        className="relative grid size-[30px] place-items-center rounded-full border border-white/15 bg-paper font-mono text-[10px] text-ink-soft"
      >
        0{n}
        <motion.span
          style={{ opacity: lit }}
          className={`absolute -inset-px grid place-items-center rounded-full font-mono text-[10px] font-semibold ${
            last ? "bg-sand text-paper shadow-[0_0_10px_rgb(var(--rgb-sand)/0.3)]" : "bg-cta text-on-cta shadow-[0_0_10px_rgb(var(--rgb-bright)/0.3)]"
          }`}
        >
          0{n}
        </motion.span>
      </span>
      <motion.div style={{ opacity: text, x }} className="pt-[3px]">
        <span className="block text-[0.98rem] font-medium leading-tight text-ink sm:text-[1.15rem]">{title}</span>
        <span className="mt-1 block text-[0.84rem] leading-snug text-ink-soft sm:text-[0.98rem]">{desc}</span>
      </motion.div>
    </li>
  );
}

const BODIES: Record<number, () => ReactNode> = { 1: WhyBody, 2: ProcessBody };

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
