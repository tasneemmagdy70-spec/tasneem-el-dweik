"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import DeepAmbient, { DepthTag } from "./DeepAmbient";
import { uiSound } from "@/lib/uiSound";

/**
 * WHAT I DO — a periodic table of the craft. The chemist's way of showing it:
 * every skill and tool is an element, the services are element *families*.
 *   · everything is visible at once (a recruiter scans it in one glance)
 *   · pick a family → its elements light up, the rest step back
 *   · hover / focus / tap an element → the inspector reads it out
 *   · front-end is "in synthesis": dashed, still forming — honest, and hopeful
 */

type FamilyId = "research" | "ui" | "ai" | "synth";

const FAMILIES: Record<FamilyId, { name: string; short: string; color: string; equation: [string, string, string]; line: string }> = {
  research: {
    name: "UX Research & Strategy",
    short: "Research",
    color: "var(--color-fam-research)",
    equation: ["Curiosity", "Users", "Insight"],
    line: "Finding the real problem before drawing a single box.",
  },
  ui: {
    name: "UI & Product Design",
    short: "UI & Product",
    color: "var(--color-fam-ui)",
    equation: ["Insight", "Figma", "Interface"],
    line: "Interfaces that feel obvious — on mobile, web and dashboards.",
  },
  ai: {
    name: "Prototyping & AI-powered Design",
    short: "AI & Prototyping",
    color: "var(--color-fam-ai)",
    equation: ["Interface", "AI", "Prototype"],
    line: "From idea to something you can click — fast, and close to the real build.",
  },
  synth: {
    name: "In synthesis: Front-end",
    short: "In synthesis",
    color: "var(--color-fam-synth)",
    equation: ["Design", "Code", "Product"],
    line: "Growing into a UI/UX developer — HTML, CSS & JavaScript on the way, so I can design an interface and build it.",
  },
};

type El = { sym: string; name: string; fam: FamilyId; kind: "Skill" | "Tool"; note: string };

const ELEMENTS: El[] = [
  // research
  { sym: "Ur", name: "User Research", fam: "research", kind: "Skill", note: "Start every project from people, not pixels." },
  { sym: "Iv", name: "Interviews", fam: "research", kind: "Skill", note: "Listening for the why behind what users say." },
  { sym: "Ut", name: "Usability Testing", fam: "research", kind: "Skill", note: "Let users prove me wrong — then fix it." },
  { sym: "Jm", name: "Journey Mapping", fam: "research", kind: "Skill", note: "Seeing the whole experience, not one screen." },
  { sym: "Ia", name: "Information Architecture", fam: "research", kind: "Skill", note: "Structure that makes content findable." },
  { sym: "He", name: "Heuristic Evaluation", fam: "research", kind: "Skill", note: "Auditing an interface against proven principles." },
  { sym: "Mz", name: "Maze", fam: "research", kind: "Tool", note: "Unmoderated usability tests and quick validation." },
  { sym: "Fj", name: "FigJam", fam: "research", kind: "Tool", note: "Affinity maps, flows and workshops." },
  // ui
  { sym: "Fi", name: "Figma", fam: "ui", kind: "Tool", note: "Where every interface takes shape." },
  { sym: "Ds", name: "Design Systems", fam: "ui", kind: "Skill", note: "Components and tokens that keep products consistent." },
  { sym: "Ma", name: "Mobile Apps", fam: "ui", kind: "Skill", note: "iOS & Android interfaces, thumb-first." },
  { sym: "Wb", name: "Websites", fam: "ui", kind: "Skill", note: "Responsive sites and landing pages." },
  { sym: "Db", name: "Dashboards", fam: "ui", kind: "Skill", note: "Dense data made readable." },
  { sym: "Ar", name: "Arabic-first & RTL", fam: "ui", kind: "Skill", note: "Interfaces designed for Arabic, not just mirrored." },
  { sym: "Ps", name: "Photoshop", fam: "ui", kind: "Tool", note: "Image editing and visual assets." },
  { sym: "Il", name: "Illustrator", fam: "ui", kind: "Tool", note: "Icons, illustrations and vector work." },
  // ai
  { sym: "Pr", name: "Interactive Prototypes", fam: "ai", kind: "Skill", note: "Flows you can click, test and hand off." },
  { sym: "Fm", name: "Figma Make", fam: "ai", kind: "Tool", note: "Turning designs into working prototypes with AI." },
  { sym: "St", name: "Stitch", fam: "ai", kind: "Tool", note: "Rapid AI-generated UI exploration." },
  { sym: "Cd", name: "Claude Design", fam: "ai", kind: "Tool", note: "Exploring directions and design ideas with AI." },
  { sym: "Cc", name: "Claude Code", fam: "ai", kind: "Tool", note: "From design to real code — this site included." },
  { sym: "Ai", name: "AI Workflow", fam: "ai", kind: "Skill", note: "Claude & ChatGPT for research synthesis and UX writing — a co-pilot, never the pilot." },
  { sym: "Hd", name: "Developer Handoff", fam: "ai", kind: "Skill", note: "Specs developers can actually build from." },
  // in synthesis
  { sym: "Ht", name: "HTML", fam: "synth", kind: "Skill", note: "Semantic structure — the bones of every page." },
  { sym: "Cs", name: "CSS", fam: "synth", kind: "Skill", note: "Layout, type and motion in the browser." },
  { sym: "Js", name: "JavaScript", fam: "synth", kind: "Skill", note: "Currently learning — the next element to stabilise." },
];

/** a theme colour at some opacity (works with CSS variables, unlike hex-alpha suffixes) */
const mix = (c: string, a: number) => `color-mix(in oklab, ${c} ${Math.round(a * 100)}%, transparent)`;

const ORDER: FamilyId[] = ["research", "ui", "ai", "synth"];
const FIRST = Object.fromEntries(ORDER.map((id) => [id, ELEMENTS.findIndex((e) => e.fam === id)])) as Record<FamilyId, number | null>;
const ease = [0.16, 1, 0.3, 1] as const;
const reveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
};

export default function WhatIDo() {
  const reduce = useReducedMotion();
  const [fam, setFam] = useState<FamilyId | null>(null);
  const [el, setEl] = useState<number | null>(null);
  const shown = el !== null ? ELEMENTS[el] : null;
  const activeFam = shown ? shown.fam : fam;
  const sectionRef = useRef<HTMLElement>(null);
  const cols = useInlineCols();
  // phone/tablet: every family keeps its own explanation open — the first element's by default,
  // so it's obvious that tapping an element explains it
  const [openBy, setOpenBy] = useState<Record<FamilyId, number | null>>(FIRST);
  // ...and the family you have scrolled to is the active one; the others step back
  const [scrollFam, setScrollFam] = useState<FamilyId | null>(null);
  const famRefs = useRef<Partial<Record<FamilyId, HTMLDivElement | null>>>({});
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setScrollFam((e.target as HTMLElement).dataset.fam as FamilyId)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    Object.values(famRefs.current).forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, []);

  // the details sheet closes itself when you scroll away from the table, or on Esc
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(([entry]) => !entry.isIntersecting && setEl(null), { threshold: 0 });
    io.observe(sec);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEl(null);
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative overflow-clip border-t border-white/[0.06] bg-paper px-6 py-16 sm:px-10 sm:py-20 lg:px-8 lg:py-24"
    >
      {/* light rising from the table itself, in the three family colours */}
      <DeepAmbient
        seed={9}
        lights={[
          { color: "var(--color-fam-research)", x: "12%", y: "42%", size: "34rem", opacity: 0.09 },
          { color: "var(--color-fam-ui)", x: "52%", y: "62%", size: "40rem", opacity: 0.1 },
          { color: "var(--color-fam-ai)", x: "88%", y: "80%", size: "34rem", opacity: 0.09 },
        ]}
      />
      <div className="relative mx-auto max-w-6xl">
        {/* header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={reveal}
          className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <DepthTag n="06" name="What I do" depth="-480m" />
            <h2 className="font-serif text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              The elements
              <br />
              of my <span className="italic text-blue-glow">craft</span>.
            </h2>
          </div>
          <p className="max-w-[24rem] text-[0.92rem] leading-relaxed text-ink-soft sm:text-[1.02rem] lg:text-[0.92rem]">
            A chemist&apos;s way of showing it: every skill and tool is an element, every service a family.
          </p>
        </motion.div>

        {/* families */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={reveal}
          role="group"
          aria-label="Services"
          className="-mx-6 mb-5 flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:scroll-px-10 sm:px-10 lg:mx-0 lg:scroll-px-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <FamilyChip label="All" color="var(--color-ink-soft)" on={fam === null} onClick={() => setFam(null)} />
          {ORDER.map((id) => (
            <FamilyChip
              key={id}
              label={FAMILIES[id].short}
              color={FAMILIES[id].color}
              dashed={id === "synth"}
              on={fam === id}
              onClick={() => setFam(fam === id ? null : id)}
            />
          ))}
        </motion.div>

        <p className="-mt-1 mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          <span aria-hidden className="relative flex size-1.5">
            {!reduce && <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-glow opacity-60" />}
            <span className="relative inline-flex size-1.5 rounded-full bg-blue-glow" />
          </span>
          <span className="lg:hidden">Tap any element to see what it means</span>
          <span className="hidden lg:inline">Hover any element to see what it means</span>
        </p>

        <div className="grid gap-5 lg:grid-cols-[1fr_19rem] lg:items-start lg:gap-6">
          {/* the table: one period (row) per family; front-end sits apart, like the f-block */}
          <div onPointerLeave={(ev) => ev.pointerType === "mouse" && setEl(null)} className="space-y-5 sm:space-y-6">
            {ORDER.map((id) => {
              const touchActive = fam ?? scrollFam;
              const famLit = cols ? touchActive === null || touchActive === id : activeFam === null || activeFam === id;
              const pick = cols ? (v: number | null) => setOpenBy((m) => ({ ...m, [id]: v })) : setEl;
              const openI = cols ? openBy[id] : el;
              return (
                <div
                  key={id}
                  ref={(n) => void (famRefs.current[id] = n)}
                  data-fam={id}
                  className={`transition-opacity duration-500 ${famLit ? "" : "opacity-60"}`}
                >
                  {/* the family, named — readable without touching anything */}
                  <div className="relative mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pb-1.5">
                    {/* the "reaction": a line of the family colour runs under its name as the row arrives */}
                    <motion.span
                      aria-hidden
                      className="absolute bottom-0 left-0 h-px w-full origin-left"
                      style={{ background: `linear-gradient(90deg, ${mix(FAMILIES[id].color, 0.67)}, transparent 70%)` }}
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-10% 0px" }}
                      transition={{ duration: 1.1, ease }}
                    />
                    <h3 className="flex items-center gap-2 text-[0.92rem] font-medium text-ink sm:text-[1rem]">
                      <span
                        aria-hidden
                        className={`size-2 rounded-full ${id === "synth" ? "border border-dashed border-ink bg-transparent" : ""}`}
                        style={id === "synth" ? undefined : { background: FAMILIES[id].color }}
                      />
                      {FAMILIES[id].name}
                    </h3>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-soft sm:text-[10px]">
                      {FAMILIES[id].equation[0]} + {FAMILIES[id].equation[1]} → <span style={{ color: FAMILIES[id].color }}>{FAMILIES[id].equation[2]}</span>
                    </span>
                  </div>
                  <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-8 sm:gap-2">
                    {(() => {
                      const idx = ELEMENTS.flatMap((e, i) => (e.fam === id ? [i] : []));
                      // phone/tablet: the explanation opens right under the tapped element's row
                      const pos = cols && openI !== null ? idx.indexOf(openI) : -1;
                      const rowEnd = pos < 0 ? -1 : Math.min(idx.length - 1, Math.floor(pos / cols) * cols + cols - 1);
                      return idx.map((i, p) => (
                        <Fragment key={ELEMENTS[i].sym}>
                          <Tile e={ELEMENTS[i]} i={i} sel={openI === i} lit={famLit} reduce={!!reduce} onPick={pick} />
                          {p === rowEnd && openI !== null && (
                            <InlineDetail e={ELEMENTS[openI]} n={openI + 1} col={pos % cols} cols={cols} onClose={() => pick(null)} />
                          )}
                        </Fragment>
                      ));
                    })()}
                  </ul>
                </div>
              );
            })}
          </div>
          {/* the inspector: reads out the family or the element in focus */}
          <div
            aria-live="polite"
            className="hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-panel/60 p-7 lg:sticky lg:top-24 lg:block lg:min-h-[13rem]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {shown ? (
                <motion.div
                  key={`el-${shown.sym}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease }}
                  className="flex gap-4 lg:gap-5"
                >
                  <div
                    className={`grid size-16 shrink-0 place-items-center rounded-xl border sm:size-20 lg:size-24 ${shown.fam === "synth" ? "border-dashed" : ""}`}
                    style={{ borderColor: mix(FAMILIES[shown.fam].color, 0.6), background: mix(FAMILIES[shown.fam].color, 0.08) }}
                  >
                    <span className="font-serif text-[2rem] leading-none sm:text-[2.4rem] lg:text-[2.8rem]" style={{ color: FAMILIES[shown.fam].color }}>
                      {shown.sym}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-soft">
                      {String(ELEMENTS.indexOf(shown) + 1).padStart(2, "0")} · {shown.kind}
                    </p>
                    <p className="mt-1 font-serif text-[1.3rem] leading-[1.05] text-ink sm:text-[1.5rem] lg:mt-1.5 lg:text-[1.6rem]">{shown.name}</p>
                    <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em]" style={{ color: FAMILIES[shown.fam].color }}>
                      {FAMILIES[shown.fam].short}
                    </p>
                    <p className="mt-2 text-[0.86rem] leading-snug text-ink-soft lg:mt-3 lg:text-[0.92rem] lg:leading-relaxed">{shown.note}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`fam-${fam ?? "all"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease }}
                >
                  {fam ? (
                    <>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: FAMILIES[fam].color }}>
                        Family · {ELEMENTS.filter((e) => e.fam === fam).length} elements
                      </p>
                      <p className="mt-2 font-serif text-[1.7rem] leading-[1.05] text-ink">{FAMILIES[fam].name}</p>
                      <Equation parts={FAMILIES[fam].equation} color={FAMILIES[fam].color} />
                      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">{FAMILIES[fam].line}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-soft">{ELEMENTS.length} elements · 3 services</p>
                      <p className="mt-2 font-serif text-[1.7rem] leading-[1.05] text-ink">
                        Research, design, <span className="italic text-blue-glow">build</span>.
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {ORDER.slice(0, 3).map((id) => (
                          <li key={id} className="text-[0.88rem] leading-snug text-ink-soft">
                            <span className="mr-2 inline-block size-1.5 rounded-full align-middle" style={{ background: FAMILIES[id].color }} />
                            <span className="text-ink">{FAMILIES[id].name}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                        <span aria-hidden className="mr-1.5 inline-block size-1 rounded-full bg-ink-soft align-middle" /> dot = tool · dashed = in synthesis
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ e, i, sel, lit, reduce, onPick }: { e: El; i: number; sel: boolean; lit: boolean; reduce: boolean; onPick: (i: number | null) => void }) {
  const c = FAMILIES[e.fam].color;
  const synth = e.fam === "synth";
  const tap = useRef({ touch: false, wasSel: false });
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.5, delay: (i % 8) * 0.04, ease }}
    >
      <button
        type="button"
        data-sound="own"
        onPointerEnter={(ev) => {
          if (ev.pointerType !== "mouse") return;
          onPick(i);
          uiSound.element();
        }}
        onPointerDown={(ev) => {
          tap.current = { touch: ev.pointerType !== "mouse", wasSel: sel };
        }}
        onFocus={() => onPick(i)}
        onClick={() => {
          // a second tap on the open element closes it (touch only — on desktop, hover drives it)
          if (tap.current.touch && tap.current.wasSel) onPick(null);
          else {
            onPick(i);
            if (tap.current.touch) uiSound.element(); // on desktop the hover already bubbled
          }
          tap.current = { touch: false, wasSel: false };
        }}
        aria-label={`${e.name} — ${e.kind}, ${FAMILIES[e.fam].name}`}
        aria-pressed={sel}
        className={`relative flex min-h-[5.6rem] w-full flex-col justify-between gap-1 rounded-lg border p-2 text-left transition-all duration-300 ease-out-expo sm:p-2 ${
          synth ? "border-dashed" : ""
        } ${lit ? "opacity-100" : "opacity-20"} ${sel ? "-translate-y-1" : "hover:-translate-y-1"}`}
        style={{ borderColor: mix(c, sel ? 0.8 : 0.36), background: mix(c, sel ? 0.16 : 0.09) }}
      >
        <span className="flex items-start justify-between font-mono text-[8px] leading-none text-ink-soft sm:text-[9px]">
          {String(i + 1).padStart(2, "0")}
          {e.kind === "Tool" && <span aria-hidden className="size-1 rounded-full" style={{ background: c }} />}
        </span>
        <span className="font-serif text-[1.35rem] leading-none sm:text-[1.4rem] lg:text-[1.5rem]" style={{ color: c }}>
          {e.sym}
        </span>
        <span className="line-clamp-2 text-[10px] font-medium leading-[1.15] text-ink/85 sm:text-[10px] lg:text-[10.5px]">{e.name}</span>
        {synth && !reduce && (
          <span aria-hidden className="pointer-events-none absolute inset-0 animate-pulse rounded-lg border border-dashed border-white/10" />
        )}
      </button>
    </motion.li>
  );
}

function FamilyChip({ label, color, on, dashed = false, onClick }: { label: string; color: string; on: boolean; dashed?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 sm:text-[11px] ${
        dashed && !on ? "border-dashed" : ""
      } ${on ? "font-semibold text-paper" : "text-ink-soft hover:text-ink"}`}
      style={{ borderColor: on ? color : "color-mix(in oklab, var(--color-white) 14%, transparent)", background: on ? color : "transparent" }}
    >
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: on ? "var(--color-paper)" : color }} />
      {label}
    </button>
  );
}

/** a + b → c, drawn like a reaction */
function Equation({ parts, color }: { parts: [string, string, string]; color: string }) {
  const [a, b, c] = parts;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
      <span>{a}</span>
      <span className="text-ink-soft">+</span>
      <span>{b}</span>
      <motion.span
        aria-hidden
        className="inline-block h-px w-8 origin-left"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease }}
      />
      <span className="sr-only">gives</span>
      <span style={{ color }}>{c}</span>
    </p>
  );
}

/** Columns of the table below the desktop breakpoint (3 phone, 8 tablet); 0 on desktop, where the side card reads instead. */
function useInlineCols() {
  return useSyncExternalStore(
    (cb) => {
      const a = window.matchMedia("(min-width: 1024px)");
      const b = window.matchMedia("(min-width: 640px)");
      a.addEventListener("change", cb);
      b.addEventListener("change", cb);
      return () => {
        a.removeEventListener("change", cb);
        b.removeEventListener("change", cb);
      };
    },
    () => (window.matchMedia("(min-width: 1024px)").matches ? 0 : window.matchMedia("(min-width: 640px)").matches ? 8 : 3),
    () => 0,
  );
}

/** The explanation, opened in place: full row width, right under the tapped element, with a notch pointing at it. */
function InlineDetail({ e, n, col, cols, onClose }: { e: El; n: number; col: number; cols: number; onClose: () => void }) {
  const c = FAMILIES[e.fam].color;
  return (
    <motion.li
      key={e.sym}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className="relative col-span-3 mt-1.5 sm:col-span-8"
      aria-live="polite"
    >
      {/* notch pointing up at the element */}
      <span
        aria-hidden
        className="absolute -top-[5px] size-2.5 -translate-x-1/2 rotate-45 border-l border-t bg-panel"
        style={{ left: `${((col + 0.5) / cols) * 100}%`, borderColor: mix(c, 0.4) }}
      />
      <div className="relative flex gap-3.5 rounded-xl border bg-panel p-3.5 pr-10" style={{ borderColor: mix(c, 0.4) }}>
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-lg border font-serif text-[1.5rem] leading-none ${e.fam === "synth" ? "border-dashed" : ""}`}
          style={{ color: c, borderColor: mix(c, 0.5), background: mix(c, 0.1) }}
        >
          {e.sym}
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
            {String(n).padStart(2, "0")} · {e.kind} · <span style={{ color: c }}>{FAMILIES[e.fam].short}</span>
          </span>
          <span className="mt-1 block font-serif text-[1.2rem] leading-tight text-ink">{e.name}</span>
          <span className="mt-1 block text-[0.86rem] leading-snug text-ink-soft">{e.note}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:text-ink"
        >
          ✕
        </button>
      </div>
    </motion.li>
  );
}
