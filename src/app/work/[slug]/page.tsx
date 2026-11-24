import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans } from "next/font/google";
import { CASE_STUDIES, caseStudy, type Figure } from "@/lib/case-studies";
import { NOVU_ICONS } from "@/lib/novu-icons";
import { FEATURED } from "@/lib/projects";
import { BTN_PRIMARY_MD, BTN_PRIMARY_MD_ICON } from "@/lib/ui";
import { ArrowUpRight } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import CaseProgress from "@/components/case/CaseProgress";
import Reveal from "@/components/case/Reveal";
import SnapStrip from "@/components/case/SnapStrip";

// NOVU's own typeface, for its design-system specimen
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

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

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/* ── top bar: just home and the theme — and a hairline of reading progress ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-paper/85 backdrop-blur-md">
        <div className={`mx-auto flex h-16 max-w-6xl items-center justify-between ${GUTTER}`}>
          <Link href="/" className="font-script text-[1.7rem] leading-none text-ink transition-colors hover:text-blue-glow" aria-label="El-Dweik — home">
            El-Dweik
          </Link>
          <ThemeToggle />
        </div>
        <CaseProgress />
      </header>

      <main>
        {/* ── the opening: back, what it is (left) and the problem it solves (right) ── */}
        <section className={`${GUTTER} pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-14`}>
          <div className="mx-auto max-w-6xl">
            <Link
              href="/#best-work"
              className="group/back -ml-1 inline-flex min-h-11 items-center gap-3 rounded-full pr-3 text-[0.92rem] text-ink-soft transition-colors hover:text-ink"
            >
              <span className="grid size-10 place-items-center rounded-full border border-white/15 transition-[border-color,transform] duration-300 group-hover/back:-translate-x-0.5 group-hover/back:border-blue-glow/60 group-active/back:scale-95">
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
                </svg>
              </span>
              Back to projects
            </Link>

            <div className="mt-8 grid gap-10 sm:mt-10 md:grid-cols-2 md:items-end md:gap-10 lg:gap-16">
              <Reveal>
                <p className="flex items-center gap-3 font-mono text-[11px] uppercase text-blue-glow">
                  <span>
                    {c.n} / {String(FEATURED.length).padStart(2, "0")}
                  </span>
                  <span className="h-px w-8 bg-blue-glow/50" />
                  <span className="text-ink-soft">{c.readTime}</span>
                </p>
                <h1 className="mt-4 font-serif text-[clamp(3.5rem,9vw,6rem)] leading-[0.92] tracking-[-0.02em]">{c.name}</h1>
                <p className="mt-5 max-w-md text-[1.1rem] leading-snug text-ink-soft sm:text-[1.2rem]">{c.tagline}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {c.chips.map((x) => (
                    <li key={x} className="rounded-full border border-white/12 px-3.5 py-1.5 text-[0.85rem] text-ink">
                      {x}
                    </li>
                  ))}
                </ul>
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

        {/* ── key decisions: a picture and one line of "why" each (swipe on phones) ── */}
        <Band label="Key decisions" n="01">
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

        {/* ── design system: grouped like a spec — colour, type, grid & icons, components ── */}
        <Band label="Design system" n="02">
          <div className="grid gap-4 md:grid-cols-12">
            {/* colour */}
            <Reveal className="md:col-span-7">
              <Spec title="Color">
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {c.system.colors.map((col) => (
                    <div key={col.hex}>
                      <div className="h-24 rounded-xl ring-1 ring-white/10 sm:h-32" style={{ background: col.hex }} />
                      <p className="mt-2.5 text-[0.82rem] leading-tight text-ink sm:text-[0.88rem]">{col.name.split(" · ")[0]}</p>
                      <p className="font-mono text-[11px] uppercase text-ink-soft">{col.hex}</p>
                    </div>
                  ))}
                </div>
              </Spec>
            </Reveal>

            {/* type */}
            <Reveal delay={90} className="md:col-span-5">
              <Spec title="Type">
                <div className={`flex items-end justify-between gap-4 ${plex.className}`}>
                  <div>
                    <p className="text-[4rem] font-bold leading-[0.9] text-[#895CDD]">Aa</p>
                    <p className="mt-2 text-[1.05rem] font-bold">{c.system.font}</p>
                  </div>
                  <ul className="space-y-1 text-right">
                    {c.system.sizes.map((s) => (
                      <li key={s} className="leading-none" style={{ fontSize: Math.round(s * 0.62) }}>
                        {s}
                        <span className="ml-1 font-mono text-[10px] text-ink-soft">px</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Spec>
            </Reveal>

            {/* grid & icons — the grid drawn over real NOVU screens, and its own icons */}
            <Reveal className="md:col-span-5">
              <Spec title="Grid & icons">
                <div className="flex items-end gap-3">
                  <GridOnScreen figure={c.screens.mobile[2]} cols={4} className="w-[26%]" label="4 col" />
                  <GridOnScreen figure={c.screens.web[1]} cols={12} className="flex-1" label="12 col" />
                </div>
                <ul className="mt-6 grid grid-cols-8 gap-1.5" aria-label="Some of NOVU's 40+ icons">
                  {NOVU_ICONS.map((ic) => (
                    <li key={ic.name} className="grid aspect-square place-items-center rounded-lg bg-white/[0.04] text-[#a98be8]">
                      <svg viewBox={ic.viewBox} className="size-[55%]" aria-hidden dangerouslySetInnerHTML={{ __html: ic.body }} />
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[0.88rem] text-ink-soft">
                  <span className="text-ink">40+</span> icons in one stroke style
                </p>
              </Spec>
            </Reveal>

            {/* components */}
            <Reveal delay={90} className="md:col-span-7">
              <Spec title="Components" flush>
                <div className="relative h-56 overflow-hidden rounded-xl bg-white sm:h-72 md:h-full md:min-h-[13rem]">
                  <Image
                    src={c.system.components.src}
                    alt={c.system.components.alt}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover object-[center_95%]"
                  />
                </div>
              </Spec>
            </Reveal>
          </div>
        </Band>

        {/* ── final screens: phones in a row, then the web app and the dashboard in browser frames ── */}
        <Band label="Final screens" n="03">
          <Sub title="Mobile app" />
          <SnapStrip className="lg:grid-cols-5 lg:gap-5 lg:pb-8">
            {c.screens.mobile.map((s, i) => (
              <li key={s.src} className="group/card w-[56%] shrink-0 snap-start sm:w-[34%] lg:w-auto">
                <Reveal delay={i * 70}>
                  <Phone figure={s} lift={i % 2 === 1} />
                </Reveal>
              </li>
            ))}
          </SnapStrip>

          <Sub title="Web app" className="mt-14 lg:mt-20" />
          <div className="grid gap-5 md:grid-cols-2">
            {c.screens.web.map((s, i) => (
              <Reveal key={s.src} delay={i * 90}>
                <Browser figure={s} />
              </Reveal>
            ))}
          </div>

          <Sub title="Admin dashboard" className="mt-14 lg:mt-20" />
          <div className="grid gap-5 md:grid-cols-2">
            {c.screens.dashboard.map((s, i) => (
              <Reveal key={s.src} delay={i * 90}>
                <Browser figure={s} />
              </Reveal>
            ))}
          </div>
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
              <nav aria-label="More work" className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link href="/#best-work" className="rounded-2xl border border-white/10 p-6 transition-colors hover:border-blue-glow/50">
                  <p className="font-mono text-[11px] uppercase text-ink-soft">← Back</p>
                  <p className="mt-2 text-[1.1rem] font-semibold">All projects</p>
                </Link>
                <a
                  href={nextHref}
                  {...(nextExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="rounded-2xl border border-white/10 p-6 text-right transition-colors hover:border-blue-glow/50"
                >
                  <p className="font-mono text-[11px] uppercase text-ink-soft">Next project →</p>
                  <p className="mt-2 text-[1.1rem] font-semibold">{nextProject.name}</p>
                </a>
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

/** A small label above a group of screens. */
function Sub({ title, className = "" }: { title: string; className?: string }) {
  return <h3 className={`mb-5 text-[1.05rem] font-semibold text-ink ${className}`}>{title}</h3>;
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
function GridOnScreen({ figure, cols, label, className = "" }: { figure: Figure; cols: number; label: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-md bg-white ring-1 ring-white/10" style={{ aspectRatio: figure.w / figure.h }}>
        <Image src={figure.src} alt="" fill sizes="240px" className="object-cover object-top opacity-80" />
        <div className="absolute inset-0 flex gap-[4%] px-[5%]" aria-hidden>
          {Array.from({ length: cols }, (_, i) => (
            <span key={i} className="flex-1 bg-[#895CDD]/25" />
          ))}
        </div>
      </div>
      <figcaption className="mt-2 font-mono text-[11px] uppercase text-ink-soft">{label}</figcaption>
    </figure>
  );
}

/** A phone: the screen inside a slim bezel. */
function Phone({ figure, lift }: { figure: Figure; lift: boolean }) {
  return (
    <div
      className={`rounded-[1.9rem] border border-white/12 bg-[#0b0d16] p-[5px] shadow-[0_24px_48px_-28px_rgba(0,0,0,0.8)] transition-[transform,border-color] duration-500 ease-out-expo max-lg:group-data-[active=true]/card:-translate-y-1 max-lg:group-data-[active=true]/card:border-blue-glow/40 lg:hover:-translate-y-2 lg:hover:border-blue-glow/40 ${lift ? "lg:translate-y-8" : ""}`}
    >
      <div className="relative aspect-[375/812] overflow-hidden rounded-[1.6rem] bg-white">
        <Image src={figure.src} alt={figure.alt} fill sizes="(min-width: 1024px) 210px, 56vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

/** A browser window: three dots, then the screen. */
function Browser({ figure }: { figure: Figure }) {
  return (
    <figure className="group overflow-hidden rounded-2xl border border-white/10 bg-panel/60 transition-[transform,border-color] duration-500 ease-out-expo lg:hover:-translate-y-1 lg:hover:border-blue-glow/40">
      <div className="flex items-center gap-1.5 px-4 py-3" aria-hidden>
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
      </div>
      <div className="relative overflow-hidden bg-white" style={{ aspectRatio: figure.w / figure.h }}>
        <Image src={figure.src} alt={figure.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover object-top" />
      </div>
      <figcaption className="sr-only">{figure.alt}</figcaption>
    </figure>
  );
}
