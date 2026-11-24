import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans } from "next/font/google";
import { CASE_STUDIES, caseStudy, type Figure } from "@/lib/case-studies";
import { FEATURED } from "@/lib/projects";
import { BTN_PRIMARY_MD, BTN_PRIMARY_MD_ICON } from "@/lib/ui";
import { ArrowUpRight } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import CaseProgress from "@/components/case/CaseProgress";
import Reveal from "@/components/case/Reveal";
import SnapStrip from "@/components/case/SnapStrip";
import ArtifactZoom from "@/components/case/ArtifactZoom";

// each project's own typeface, for its design-system specimen (Inter is the site's own font)
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const FONT_CLASS: Record<string, string> = { "IBM Plex Sans": plex.className, Inter: "font-sans" };

// every case study is prerendered (generateStaticParams); an unknown slug simply 404s,
// so the route may wait for its params rather than stream a placeholder
export const instant = false;

/** One side margin for the whole page, so every block lines up on the same edge. */
const GUTTER = "px-6 sm:px-10 lg:px-12";
/** A swiped card: most of the row on phones, half on tablets, a grid cell on desktop. */
const SWIPE_ITEM = "group/card w-[86%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-auto";
/** The card that has come to rest in a swiped row (phones) or is hovered (desktop). */
const LIFT =
  "transition-[transform,border-color,box-shadow] duration-500 ease-out-expo max-lg:group-data-[active=true]/card:-translate-y-1 max-lg:group-data-[active=true]/card:border-blue-glow/40 lg:hover:-translate-y-1 lg:hover:border-blue-glow/40 lg:hover:shadow-[0_18px_40px_-24px_rgb(var(--rgb-bright)/0.6)]";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = caseStudy(slug);
  if (!c) return {};
  return {
    title: `${c.name} — Case study · Tasneem El-Dweik`,
    description: c.tagline,
    openGraph: { title: `${c.name} — Case study`, description: c.tagline, images: [{ url: c.cover.src, width: c.cover.w, height: c.cover.h }] },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseStudy(slug);
  if (!c) notFound();

  const at = FEATURED.findIndex((p) => p.name === c.name);
  const nextProject = FEATURED[(at + 1) % FEATURED.length];
  const nextHref = nextProject.caseStudy ?? nextProject.href;
  const nextExternal = !nextProject.caseStudy;
  const prevProject = FEATURED[(at - 1 + FEATURED.length) % FEATURED.length];
  const prevHref = prevProject.caseStudy ?? prevProject.href;
  const prevExternal = !prevProject.caseStudy;
  const accent = c.accent ?? c.system?.colors[0].hex ?? "#5b8cff"; // the project's brand colour, for its own specimens
  const system = c.system;
  // sections are numbered in the order they appear; a project without one simply skips it
  const nScreens = system ? "04" : "03";
  const noun = c.screens.noun ?? "screens";

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/* ── top bar, stuck to the top while you scroll: back to the projects (left), home, the theme — and a hairline of reading progress ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-paper/85 backdrop-blur-md">
        <div className={`mx-auto flex h-16 max-w-6xl items-center justify-between ${GUTTER}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/#best-work"
              aria-label="Back to projects"
              title="Back to projects"
              className="-ml-1 grid size-10 place-items-center rounded-full border border-white/15 text-ink transition-[border-color,transform,color] duration-300 hover:-translate-x-0.5 hover:border-blue-glow/60 hover:text-blue-glow active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
              </svg>
            </Link>
            <Link href="/" className="font-script text-[1.7rem] leading-none text-ink transition-colors hover:text-blue-glow" aria-label="El-Dweik — home">
              El-Dweik
            </Link>
          </div>
          <ThemeToggle />
        </div>
        <CaseProgress />
      </header>

      <main>
        {/* ── the opening: what it is (left) and the problem it solves (right) ── */}
        <section className={`${GUTTER} pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20`}>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 md:grid-cols-2 md:items-end md:gap-10 lg:gap-16">
              <Reveal className="min-w-0">
                <p className="font-mono text-[11px] uppercase text-blue-glow">
                  {c.n} / {String(FEATURED.length).padStart(2, "0")}
                </p>
                <h1 className="mt-4 font-serif text-[clamp(3.5rem,9vw,6rem)] leading-[0.92] tracking-[-0.02em]">{c.name}</h1>
                <p className="mt-5 max-w-md text-[1.1rem] leading-snug text-ink-soft sm:text-[1.2rem]">{c.tagline}</p>
                {/* what the project covers — a slow loop of chips, faded at both edges */}
                <div className="case-marquee-wrap mt-7 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
                  <ul className="case-marquee flex w-max gap-2" aria-label="What the project covers">
                    {[...c.chips, ...c.chips].map((x, i) => (
                      <li
                        key={i}
                        aria-hidden={i >= c.chips.length || undefined}
                        className="whitespace-nowrap rounded-full border border-white/12 px-3.5 py-1.5 text-[0.85rem] text-ink"
                      >
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="rounded-3xl border border-white/10 bg-panel/50 p-7 sm:p-8 lg:p-9">
                  <p className="font-mono text-[11px] uppercase text-blue-glow">The problem</p>
                  <p className="mt-4 font-serif text-[clamp(1.6rem,3.2vw,2.25rem)] leading-[1.12] tracking-[-0.01em]">
                    {c.problem.before}
                    <span className="italic text-blue-glow">{c.problem.lit}</span>
                    {c.problem.after}
                  </p>
                  <p className="mt-6 border-l-2 border-sand pl-4 text-[0.98rem] italic leading-relaxed text-ink-soft">“{c.problem.quote}”</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── UX process: the research behind the screens — numbers, five phases with their artifacts, what we learned ── */}
        <Band label="UX process" n="01">
          <p className="max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">
            Design thinking, end to end. Every screen further down traces back to one of these steps.
          </p>

          <Reveal>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {c.process.stats.map((x) => (
                <div key={x.label} className="bg-paper p-5 sm:p-6">
                  <dt className="sr-only">{x.label}</dt>
                  <dd>
                    <span className="block font-serif text-[2.4rem] leading-none text-blue-glow">{x.value}</span>
                    <span className="mt-2 block text-[0.9rem] text-ink-soft">{x.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <SnapStrip className={`mt-6 lg:gap-4 lg:pb-0 ${c.process.phases.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
            {c.process.phases.map((p, i) => (
              <li key={p.name} className="group/card w-[72%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
                <Reveal delay={i * 70} className="h-full">
                  <article className={`flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/50 ${LIFT}`}>
                    <ArtifactZoom figure={p.figure} label={`${p.name} · ${p.methods[0]}`} accent={accent} />
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-mono text-[11px] uppercase text-blue-glow">0{i + 1}</p>
                      <h3 className="mt-1 font-serif text-[1.35rem] leading-tight">{p.name}</h3>
                      <ul className="mt-3 space-y-1.5 text-[0.88rem] leading-snug text-ink-soft">
                        {p.methods.map((m) => (
                          <li key={m} className="flex gap-2">
                            <span className="mt-[0.45em] size-1 shrink-0 rounded-full bg-blue-glow/70" aria-hidden />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </SnapStrip>

          <Sub title="What research told us" className="mt-12 lg:mt-16" />
          <div className="grid gap-4 md:grid-cols-3">
            {c.process.insights.map((x, i) => (
              <Reveal key={x.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/10 p-6">
                  <p className="font-serif text-[1.25rem] leading-tight">{x.title}</p>
                  <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-soft">{x.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Band>

        {/* ── key decisions: a picture and one line of "why" each (swipe on phones) ── */}
        <Band label="Key decisions" n="02">
          <SnapStrip className="lg:grid-cols-3 lg:gap-5 lg:pb-0">
            {c.decisions.map((d, i) => (
              <li key={d.title} className={SWIPE_ITEM}>
                <Reveal delay={i * 90} className="h-full">
                  <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/50 ${LIFT}`}>
                    <div className="relative aspect-[16/10] overflow-hidden bg-white">
                      <Image
                        src={d.figure.src}
                        alt={d.figure.alt}
                        fill
                        sizes="(min-width: 1024px) 360px, 86vw"
                        className="object-cover object-top transition-transform duration-700 ease-out-expo max-lg:group-data-[active=true]/card:scale-[1.04] lg:group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="font-mono text-[11px] uppercase text-blue-glow">0{i + 1}</p>
                      <h3 className="mt-1.5 font-serif text-[1.4rem] leading-tight">{d.title}</h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{d.why}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </SnapStrip>
        </Band>

        {/* ── design system: grouped like a spec — colour and type, then grid & icons, components or the brand ── */}
        {system && (
        <Band label="Design system" n="03">
          <div className="grid gap-4 md:grid-cols-12">
            {/* colour */}
            <Reveal className="md:col-span-7">
              <Spec title="Color">
                <div
                  className="grid grid-cols-[repeat(var(--mcols),minmax(0,1fr))] gap-x-2.5 gap-y-5 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] sm:gap-3"
                  style={{ "--cols": system.colors.length, "--mcols": system.colors.length > 4 ? 3 : system.colors.length } as React.CSSProperties}
                >
                  {system.colors.map((col) => (
                    <div key={col.hex}>
                      <div className="h-24 rounded-xl ring-1 ring-white/10 sm:h-32" style={{ background: col.hex }} />
                      <p className="mt-2.5 text-[0.82rem] leading-tight text-ink sm:text-[0.88rem]">{col.name}</p>
                      <p className="font-mono text-[11px] uppercase text-ink-soft">{col.hex}</p>
                    </div>
                  ))}
                </div>
              </Spec>
            </Reveal>

            {/* type: the scale, or the weights in use */}
            <Reveal delay={90} className="md:col-span-5">
              <Spec title="Type">
                <div className={`flex items-end justify-between gap-4 ${FONT_CLASS[system.font] ?? ""}`}>
                  <div>
                    <p className="text-[4rem] font-bold leading-[0.9]" style={{ color: accent }}>
                      Aa
                    </p>
                    <p className="mt-2 text-[1.05rem] font-bold">{system.font}</p>
                  </div>
                  <ul className="space-y-1 text-right">
                    {system.sizes?.map((s) => (
                      <li key={s} className="leading-none" style={{ fontSize: Math.round(s * 0.62) }}>
                        {s}
                        <span className="ml-1 font-mono text-[10px] text-ink-soft">px</span>
                      </li>
                    ))}
                    {system.weights?.map((w) => (
                      <li key={w.name} className="text-[0.95rem] leading-tight" style={{ fontWeight: w.value }}>
                        {w.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </Spec>
            </Reveal>

            {/* grid & icons — the grid drawn over real screens, and the project's own icons */}
            {(system.grid || system.icons) && (
              <Reveal className="md:col-span-5">
                <Spec title="Grid & icons">
                  {system.grid && (
                    <div className="flex items-end gap-3">
                      <GridOnScreen figure={system.grid.mobile} cols={4} className="w-[26%]" label="4 col" accent={accent} />
                      <GridOnScreen figure={system.grid.desktop} cols={12} className="flex-1" label="12 col" accent={accent} />
                    </div>
                  )}
                  {system.icons && (
                    <>
                      <ul className="mt-6 grid grid-cols-8 gap-1.5" aria-label={`Some of ${c.name}'s icons`}>
                        {system.icons.set.map((ic) => (
                          <li key={ic.name} className="grid aspect-square place-items-center rounded-lg bg-white/[0.04]" style={{ color: accent }}>
                            <svg viewBox={ic.viewBox} className="size-[55%]" aria-hidden dangerouslySetInnerHTML={{ __html: ic.body }} />
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[0.88rem] text-ink-soft">{system.icons.note}</p>
                    </>
                  )}
                </Spec>
              </Reveal>
            )}

            {/* components */}
            {system.components && (
              <Reveal delay={90} className="md:col-span-7">
                <Spec title="Components" flush>
                  <div className="relative h-56 overflow-hidden rounded-xl bg-white sm:h-72 md:h-full md:min-h-[13rem]">
                    <Image src={system.components.src} alt={system.components.alt} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover object-[center_95%]" />
                  </div>
                </Spec>
              </Reveal>
            )}

            {/* brand — the logo and identity, wide */}
            {system.brand && (
              <Reveal className="md:col-span-12">
                <Spec title="Brand" flush>
                  <div className="relative h-48 overflow-hidden rounded-xl bg-white sm:h-64 lg:h-72">
                    <Image src={system.brand.src} alt={system.brand.alt} fill sizes="(min-width: 1024px) 1100px, 100vw" className="object-cover object-center" />
                  </div>
                </Spec>
              </Reveal>
            )}
          </div>
        </Band>

        )}

        {/* ── final screens: phones in a row, then the web app and the dashboard in browser frames ── */}
        <Band label={c.screens.title ?? "Final screens"} n={nScreens}>
          <Sub title="Mobile" note={screensNote(c.screens.mobile.reduce((n, f) => n + f.shots.length, 0), c.screens.totals.mobile, noun)} />
          <div className="space-y-4">
            {c.screens.mobile.map((flow, f) => (
              <Reveal key={flow.title}>
                <div className="grid gap-6 overflow-hidden rounded-3xl border border-white/10 bg-panel/40 p-5 sm:p-8 md:grid-cols-[13rem_1fr] md:items-center md:gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12 lg:p-10">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-blue-glow">Flow 0{f + 1}</p>
                    <h4 className="mt-2 font-serif text-[1.5rem] leading-tight">{flow.title}</h4>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{flow.note}</p>
                  </div>
                  <div className="flex items-start pb-4 pt-1 md:pb-6">
                    {flow.shots.map((s, i) => (
                      <div
                        key={s.src}
                        className={`relative w-[29%] shrink-0 transition-transform duration-500 ease-out-expo hover:z-20 hover:-translate-y-2 sm:w-[27%] md:w-[25%] ${i ? "-ml-[5.3%] sm:-ml-[2.6%] md:ml-[2%]" : ""} ${i % 2 ? "translate-y-4 md:translate-y-6" : ""}`}
                        style={{ zIndex: 10 - Math.abs(i - 1) }}
                      >
                        <Phone figure={s} />
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {c.screens.web && (
            <>
              <Sub title="Web" note={screensNote(c.screens.web.length, c.screens.totals.web, noun)} className="mt-14 lg:mt-20" />
              <Reveal>
                <Collection shots={c.screens.web} />
              </Reveal>
            </>
          )}

          {c.screens.dashboard && (
            <>
              <Sub title="Admin dashboard" note={screensNote(c.screens.dashboard.length, c.screens.totals.dashboard, noun)} className="mt-14 lg:mt-20" />
              <Reveal>
                <Collection shots={c.screens.dashboard} mirror />
              </Reveal>
            </>
          )}
        </Band>

        {/* ── impact in numbers, then where to go next ── */}
        <section className={`border-t border-white/[0.06] ${GUTTER} py-16 lg:py-24`}>
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
                {c.impact.map((x) => (
                  <div key={x.label}>
                    <dt className="sr-only">{x.label}</dt>
                    <dd>
                      <span className="block font-serif text-[clamp(2.6rem,6vw,4rem)] leading-none text-ink">{x.value}</span>
                      <span className="mt-2 block text-[0.92rem] text-ink-soft">{x.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={90} className="mt-16">
              <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-panel/50 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
                <p className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight">The full process is on Behance.</p>
                <a href={c.behance} target="_blank" rel="noopener noreferrer" className={`${BTN_PRIMARY_MD} self-start lg:self-auto`}>
                  Open on Behance
                  <span className={BTN_PRIMARY_MD_ICON}>
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </a>
              </div>
              {/* previous / next project — two small arrows, the way you'd flip a page */}
              <nav aria-label="More projects" className="mt-12 flex items-center justify-between gap-4">
                <ProjectArrow dir="prev" href={prevHref} external={prevExternal} name={prevProject.name} />
                <ProjectArrow dir="next" href={nextHref} external={nextExternal} name={nextProject.name} />
              </nav>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className={`border-t border-white/[0.06] ${GUTTER} py-8 text-center font-mono text-[11px] uppercase text-ink-soft`}>© 2026 Tasneem El-Dweik</footer>
    </div>
  );
}

/** One section: its title as a small heading (number + label), then the content. */
function Band({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <section className={`border-t border-white/[0.06] ${GUTTER} py-16 lg:py-24`}>
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 flex items-center gap-3 font-mono text-[12px] uppercase text-blue-glow lg:mb-10">
          <span>{n}</span>
          <span className="h-px w-8 bg-blue-glow/50" />
          <span className="text-ink">{label}</span>
        </h2>
        {children}
      </div>
    </section>
  );
}

/** "12 of 40+ screens", or "all 8 screens" when every one is shown. */
function screensNote(shown: number, total?: string, noun = "screens") {
  if (!total) return `${shown} ${noun}`;
  return shown >= Number(total) ? `all ${total} ${noun}` : `${shown} of ${total} ${noun}`;
}

/** A small label above a group, with an optional note (e.g. how many screens are shown). */
function Sub({ title, note, className = "" }: { title: string; note?: string; className?: string }) {
  return (
    <h3 className={`mb-5 flex items-baseline gap-3 text-[1.05rem] font-semibold text-ink ${className}`}>
      {title}
      {note && <span className="font-mono text-[11px] font-normal uppercase text-ink-soft">{note}</span>}
    </h3>
  );
}

/** A design-system card: a small sub-heading and its sample. */
function Spec({ title, children, flush = false }: { title: string; children: React.ReactNode; flush?: boolean }) {
  return (
    <div className={`flex h-full flex-col rounded-2xl border border-white/10 bg-panel/50 ${flush ? "p-3 pt-5 sm:p-4 sm:pt-6" : "p-6 sm:p-7"}`}>
      <p className={`mb-5 font-mono text-[11px] uppercase text-ink-soft ${flush ? "px-3" : ""}`}>{title}</p>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/** A real screen with its column grid laid over it. */
function GridOnScreen({ figure, cols, label, accent, className = "" }: { figure: Figure; cols: number; label: string; accent: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-md bg-white ring-1 ring-white/10" style={{ aspectRatio: figure.w / figure.h }}>
        <Image src={figure.src} alt="" fill sizes="240px" className="object-cover object-top opacity-80" />
        <div className="absolute inset-0 flex gap-[4%] px-[5%]" aria-hidden>
          {Array.from({ length: cols }, (_, i) => (
            <span key={i} className="flex-1 opacity-25" style={{ background: accent }} />
          ))}
        </div>
      </div>
      <figcaption className="mt-2 font-mono text-[11px] uppercase text-ink-soft">{label}</figcaption>
    </figure>
  );
}

/** A phone: the screen inside a slim bezel. */
function Phone({ figure }: { figure: Figure }) {
  return (
    <div className="rounded-[14%/6.5%] border border-white/12 bg-[#0b0d16] p-[3.5%] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)]">
      <div className="relative aspect-[375/812] overflow-hidden rounded-[11%/5%] bg-white">
        <Image src={figure.src} alt={figure.alt} fill sizes="(min-width: 1024px) 200px, 30vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * Several screens of one platform as one collection: the first leads, big, and the rest
 * sit beside it in a 2×2 grid (`mirror` puts the lead on the other side). On phones the
 * lead runs full width and the rest pair up under it.
 */
function Collection({ shots, mirror = false }: { shots: Figure[]; mirror?: boolean }) {
  const [lead, ...rest] = shots;
  const beside = rest.slice(0, 4); // the 2×2 next to the lead
  const more = rest.slice(4); // the rest, one row underneath
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* a short set (lead + 2) sits in 3 columns; a full one (lead + 4) in 4 */}
      <div className={`grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 ${beside.length <= 2 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        <Browser
          figure={lead}
          className={`col-span-2 lg:row-span-2 ${mirror ? (beside.length <= 2 ? "lg:col-start-2" : "lg:col-start-3") : ""}`}
          large
        />
        {beside.map((s) => (
          <Browser key={s.src} figure={s} />
        ))}
      </div>
      {more.length > 0 && (
        <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${more.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {more.map((s, i) => (
            <Browser key={s.src} figure={s} className={more.length % 2 && i === more.length - 1 ? "max-lg:col-span-2" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A browser window: three dots, then the screen. */
function Browser({ figure, large = false, className = "" }: { figure: Figure; large?: boolean; className?: string }) {
  return (
    <figure
      className={`flex flex-col overflow-hidden rounded-xl border border-white/10 bg-panel/60 transition-[transform,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-blue-glow/40 ${large ? "sm:rounded-2xl" : ""} ${className}`}
    >
      <div className={`flex items-center gap-1 ${large ? "px-4 py-3 sm:gap-1.5" : "px-2.5 py-2"}`} aria-hidden>
        {[0, 1, 2].map((d) => (
          <span key={d} className={`rounded-full bg-white/15 ${large ? "size-2.5" : "size-1.5"}`} />
        ))}
      </div>
      <div className={`relative overflow-hidden bg-white ${large ? "aspect-[1440/1024] lg:aspect-auto lg:flex-1" : "aspect-[1440/1024]"}`}>
        <Image
          src={figure.src}
          alt={figure.alt}
          fill
          sizes={large ? "(min-width: 1024px) 580px, 100vw" : "(min-width: 1024px) 280px, 50vw"}
          className="object-cover object-top"
        />
      </div>
    </figure>
  );
}

/** Previous / next project: a small circled arrow and the project's name. */
function ProjectArrow({ dir, href, external, name }: { dir: "prev" | "next"; href: string; external: boolean; name: string }) {
  const next = dir === "next";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group/arrow flex min-h-11 items-center gap-3 ${next ? "flex-row-reverse text-right" : ""}`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-ink transition-[border-color,transform,color] duration-300 group-hover/arrow:border-blue-glow/60 group-hover/arrow:text-blue-glow group-active/arrow:scale-95 ${next ? "group-hover/arrow:translate-x-0.5" : "group-hover/arrow:-translate-x-0.5"}`}
      >
        <svg viewBox="0 0 16 16" className={`size-4 ${next ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
        </svg>
      </span>
      <span>
        <span className="block font-mono text-[11px] uppercase text-ink-soft">{next ? "Next" : "Previous"}</span>
        <span className="block text-[0.98rem] font-semibold leading-tight text-ink">{name}</span>
      </span>
    </a>
  );
}
