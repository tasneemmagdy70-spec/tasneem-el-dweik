"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { MORE_WORK } from "@/lib/projects";
import { BEHANCE_URL } from "@/lib/contact";
import ProjectCover from "./ProjectCover";
import DeepAmbient, { DepthTag } from "./DeepAmbient";
import { ArrowUpRight } from "./icons";

/**
 * MORE WORK — the orbit holds the strongest work; this is the quieter tier under
 * it. Not a second gallery of the same projects: a compact index of earlier
 * work (scan it in one glance), then one clear way to everything else (Behance).
 *   every row carries its cover; on desktop the hovered row stays bright, the rest step back
 */

const ease = [0.16, 1, 0.3, 1] as const;
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, delay: i * 0.06, ease } }),
};

export default function ProjectsGrid() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <section id="work" className="relative overflow-clip border-t border-white/[0.06] bg-abyss px-6 pb-16 pt-9 sm:px-10 sm:pb-20 sm:pt-12 lg:px-8 lg:py-24">
      <DeepAmbient
        seed={5}
        lights={[
          { color: "var(--color-blue-bright)", x: "85%", y: "18%" },
          { color: "var(--color-blue-glow)", x: "8%", y: "78%", size: "36rem", opacity: 0.08 },
        ]}
      />
      <div className="relative mx-auto max-w-6xl">
        {/* header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={item}
          custom={0}
          className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <DepthTag n="05" name="More work" depth="-420m" />
            <h2 className="font-serif text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              Earlier
              <br />
              <span className="italic text-blue-glow">experiments</span>.
            </h2>
          </div>
          <p className="max-w-[24rem] text-[0.92rem] leading-relaxed text-ink-soft sm:text-[1.02rem] lg:text-[0.92rem]">
            Where the process took shape — the projects before the ones above. Each opens its case study on Behance.
          </p>
        </motion.div>

        {/* the index */}
        <div onPointerLeave={() => setHover(null)} className="relative">
          <ul className="border-t border-white/[0.08]">
            {MORE_WORK.map((p, i) => (
              <motion.li
                key={p.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-6% 0px" }}
                variants={item}
                custom={i}
                className="border-b border-white/[0.08]"
              >
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                  aria-label={`${p.name} — ${p.what}. Open case study on Behance`}
                  className={`group relative grid grid-cols-[5.5rem_1fr_auto] items-center gap-x-4 py-4 transition-colors duration-300 active:bg-white/[0.03] sm:grid-cols-[8.5rem_1fr_auto] sm:gap-x-6 sm:py-5 lg:grid-cols-[9rem_minmax(0,1.1fr)_minmax(0,1fr)_12rem_auto] lg:gap-x-8 lg:py-5 ${
                    hover !== null && hover !== i ? "lg:opacity-40" : ""
                  }`}
                >
                  {/* cover — always there: the work itself is the colour of this section */}
                  <span className="relative block aspect-[808/632] overflow-hidden rounded-lg border border-blue-glow/25 transition-colors duration-500 group-hover:border-blue-glow/60">
                    <span className="absolute inset-0 block transition-transform duration-700 ease-out-expo group-hover:scale-105">
                      <ProjectCover project={p} index={i} sizes="(max-width: 640px) 88px, 144px" />
                    </span>
                  </span>
                  {/* name + (touch) what & meta */}
                  <span className="min-w-0">
                    <span className="block font-serif text-[1.45rem] leading-[1.05] text-ink transition-transform duration-500 ease-out-expo sm:text-[2rem] lg:text-[clamp(2rem,3vw,2.6rem)] lg:group-hover:translate-x-2">
                      {p.name}
                    </span>
                    <span className="mt-1 block truncate text-[0.82rem] text-ink-soft sm:text-[0.98rem] lg:hidden">{p.what}</span>
                    <span className="mt-1.5 block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft sm:text-[10.5px] lg:hidden">
                      {p.meta}
                    </span>
                  </span>
                  {/* what + meta (desktop) */}
                  <span className="hidden text-[0.98rem] text-ink-soft lg:block">{p.what}</span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft lg:block">{p.meta}</span>
                  {/* arrow */}
                  <span className="grid size-9 place-items-center rounded-full border border-white/12 text-ink transition-all duration-500 ease-out-expo group-hover:border-blue-glow group-hover:bg-blue-bright group-hover:text-white sm:size-11">
                    <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:rotate-45 sm:size-4" />
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Behance: the way to everything else */}
        <motion.a
          href={BEHANCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={item}
          custom={0}
          className="group relative mt-12 flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-panel p-7 sm:p-10 lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:p-12"
        >
          {/* a small atom, quietly spinning, in the corner */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="pointer-events-none absolute -right-10 -top-10 size-56 opacity-40 transition-transform duration-[2000ms] ease-out-expo group-hover:rotate-45 lg:size-72"
          >
            {[-14, 16, -30].map((t, i) => (
              <ellipse
                key={t}
                cx="100"
                cy="100"
                rx={70 + i * 12}
                ry={22 + i * 9}
                transform={`rotate(${t} 100 100)`}
                fill="none"
                style={{ stroke: "var(--color-blue-glow)" }}
                strokeOpacity={0.5 - i * 0.12}
              />
            ))}
            <circle cx="100" cy="100" r="10" style={{ fill: "var(--color-blue-bright)" }} fillOpacity="0.5" />
          </svg>
          <div className="relative">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">Still beneath the surface</p>
            <p className="font-serif text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1] tracking-[-0.02em] text-ink">
              There&apos;s more <span className="italic text-blue-glow">down here</span>.
            </p>
            <p className="mt-3 max-w-[30rem] text-[0.9rem] leading-relaxed text-ink-soft sm:text-[1rem] lg:text-[0.9rem]">
              Every project, the full case studies and the explorations in between — all on Behance.
            </p>
          </div>
          <span className="relative inline-flex w-fit items-center gap-3 rounded-full bg-cta hover:bg-cta-hover py-2 pl-5 pr-2 text-[0.88rem] font-medium text-on-cta shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            See all work on Behance
            <span className="grid size-8 place-items-center rounded-full bg-on-cta text-blue transition-transform duration-500 ease-out-expo group-hover:rotate-45">
              <ArrowUpRight className="size-3.5" />
            </span>
          </span>
        </motion.a>
      </div>
    </section>
  );
}
