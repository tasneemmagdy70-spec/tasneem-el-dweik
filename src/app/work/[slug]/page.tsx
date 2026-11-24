import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CASE_STUDIES, caseStudy, type Figure } from "@/lib/case-studies";
import { FEATURED } from "@/lib/projects";
import { BTN_PRIMARY_MD, BTN_PRIMARY_MD_ICON } from "@/lib/ui";
import { ArrowUpRight } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import CaseProgress from "@/components/case/CaseProgress";

// every case study is prerendered (generateStaticParams); an unknown slug simply 404s,
// so the route may wait for its params rather than stream a placeholder
export const instant = false;

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

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "research", label: "Research" },
  { id: "decisions", label: "Decisions" },
  { id: "design", label: "Design" },
  { id: "next", label: "What's next" },
];

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseStudy(slug);
  if (!c) notFound();

  // the next featured project (by its order on the home page)
  const at = FEATURED.findIndex((p) => p.name === c.name);
  const nextProject = FEATURED[(at + 1) % FEATURED.length];
  const nextHref = nextProject.caseStudy ?? nextProject.href;
  const nextExternal = !nextProject.caseStudy;

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/* ── top bar: the way home, and the theme ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-script text-[1.7rem] leading-none text-ink transition-colors hover:text-blue-glow" aria-label="El-Dweik — home">
            El-Dweik
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/#best-work"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.9rem] text-ink-soft transition-colors hover:text-ink"
            >
              <span aria-hidden>←</span> All work
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <CaseProgress sections={SECTIONS} />
      </header>

      <main>
        {/* ── 01 · the opening: what it is, my part, the cover ── */}
        <section id="overview" className="scroll-mt-28 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase text-blue-glow">
              <span>{c.n} / {String(FEATURED.length).padStart(2, "0")}</span>
              <span className="h-px w-8 bg-blue-glow/50" />
              <span className="text-ink-soft">Featured case study</span>
            </p>
            <h1 className="mt-4 font-serif text-[clamp(3.25rem,9vw,6.5rem)] leading-[0.95] tracking-[-0.02em]">{c.name}</h1>
            <p className="mt-5 max-w-3xl text-[1.08rem] leading-relaxed text-ink-soft sm:text-[1.2rem]">{c.tagline}</p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/10 py-6 lg:grid-cols-4">
              {c.facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-mono text-[11px] uppercase text-ink-soft">{f.label}</dt>
                  <dd className="mt-1.5 text-[0.98rem] leading-snug text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>

            {/* the cover, held in the same folder as on the home page */}
            <div className="folder relative mt-12">
              <span aria-hidden className="folder-fill absolute left-0 flex h-[31px] w-[34%] items-center rounded-t-[16px] px-5 font-mono text-[12px] font-semibold text-sand sm:w-[22%]" style={{ top: -30 }}>
                {c.n}
              </span>
              <span aria-hidden className="folder-notch absolute left-[34%] size-4 sm:left-[22%]" style={{ top: -16 }} />
              <div className="folder-fill rounded-[24px] rounded-tl-none p-2.5 sm:p-3">
                <FigureImage f={c.cover} priority sizes="(min-width: 1152px) 1120px, 100vw" className="rounded-[16px]" />
              </div>
            </div>

            {/* the case in three lines */}
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {(
                [
                  ["The problem", c.summary.problem],
                  ["The solution", c.summary.solution],
                  ["The outcome", c.summary.outcome],
                ] as const
              ).map(([t, body], i) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-panel/60 p-6">
                  <p className="font-mono text-[11px] uppercase text-blue-glow">0{i + 1}</p>
                  <h2 className="mt-2 font-serif text-[1.6rem] leading-tight">{t}</h2>
                  <p className="mt-2.5 text-[0.98rem] leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 02 · the problem ── */}
        <Section id="problem" n="01" title="The problem" lead={c.problem.statement}>
          <div className="grid gap-4 md:grid-cols-3">
            {c.problem.insights.map((ins, i) => (
              <div key={ins.title} className="rounded-2xl border border-white/10 p-6">
                <p className="font-mono text-[11px] uppercase text-sand">Insight 0{i + 1}</p>
                <h3 className="mt-2 text-[1.12rem] font-semibold leading-snug">{ins.title}</h3>
                <p className="mt-2 text-[0.96rem] leading-relaxed text-ink-soft">{ins.body}</p>
              </div>
            ))}
          </div>
          {c.problem.quote && (
            <blockquote className="mt-10 border-l-2 border-blue-glow pl-6">
              <p className="font-serif text-[clamp(1.5rem,3vw,2.1rem)] leading-snug text-ink">“{c.problem.quote.text}”</p>
              <footer className="mt-3 font-mono text-[11px] uppercase text-ink-soft">{c.problem.quote.who}</footer>
            </blockquote>
          )}
        </Section>

        {/* ── 03 · research ── */}
        <Section id="research" n="02" title="Research" lead={c.research.intro}>
          <ul className="flex flex-wrap gap-2">
            {c.research.methods.map((m) => (
              <li key={m} className="rounded-full border border-white/12 px-4 py-2 text-[0.92rem] text-ink">
                {m}
              </li>
            ))}
          </ul>
          <FigureBlock f={c.research.figure} className="mt-10" />
        </Section>

        {/* ── 04 · the decisions — the why behind each one ── */}
        <Section id="decisions" n="03" title="Key decisions" lead="Every feature answers something the research showed. Three that shaped the product:">
          <div className="space-y-16 lg:space-y-24">
            {c.decisions.map((d, i) => (
              <article key={d.title} className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <p className="font-mono text-[11px] uppercase text-blue-glow">Decision 0{i + 1}</p>
                  <h3 className="mt-2 font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[1.05]">{d.title}</h3>
                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="font-mono text-[11px] uppercase text-sand">The why</p>
                      <p className="mt-1.5 text-[1.02rem] leading-relaxed text-ink">{d.why}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase text-ink-soft">The decision</p>
                      <p className="mt-1.5 text-[1.02rem] leading-relaxed text-ink-soft">{d.what}</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
                  <div className="relative aspect-[4/3]">
                    <Image src={d.figure.src} alt={d.figure.alt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover object-top" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ── 05 · the design ── */}
        <Section id="design" n="04" title="The design" lead={c.design.intro}>
          <div className="grid gap-8 md:grid-cols-2">
            {c.design.figures.map((f, i) => (
              <FigureBlock key={f.src} f={f} className={i === 0 ? "md:row-span-2" : ""} />
            ))}
          </div>
        </Section>

        {/* ── 06 · what's next, and where to go from here ── */}
        <Section id="next" n="05" title="What's next" lead="Where the product would grow after the MVP:">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.next.map((x) => (
              <div key={x.title} className="rounded-2xl border border-white/10 p-6">
                <h3 className="text-[1.05rem] font-semibold">{x.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{x.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-8 rounded-3xl border border-white/10 bg-panel/60 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase text-ink-soft">Want every detail?</p>
              <p className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-tight">The full case study is on Behance.</p>
            </div>
            <a href={c.behance} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY_MD}>
              Open on Behance
              <span className={BTN_PRIMARY_MD_ICON}>
                <ArrowUpRight className="size-3.5" />
              </span>
            </a>
          </div>

          <nav aria-label="More work" className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/#best-work" className="group rounded-2xl border border-white/10 p-6 transition-colors hover:border-blue-glow/50">
              <p className="font-mono text-[11px] uppercase text-ink-soft">← Back</p>
              <p className="mt-2 text-[1.15rem] font-semibold">All best work</p>
            </Link>
            <a
              href={nextHref}
              {...(nextExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group rounded-2xl border border-white/10 p-6 text-right transition-colors hover:border-blue-glow/50"
            >
              <p className="font-mono text-[11px] uppercase text-ink-soft">Next project →</p>
              <p className="mt-2 text-[1.15rem] font-semibold">{nextProject.name}</p>
            </a>
          </nav>
        </Section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-center font-mono text-[11px] uppercase text-ink-soft sm:px-8">
        © 2026 Tasneem El-Dweik
      </footer>
    </div>
  );
}

function Section({ id, n, title, lead, children }: { id: string; n: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/[0.06] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase text-blue-glow">
          <span>{n}</span>
          <span className="h-px w-8 bg-blue-glow/50" />
        </p>
        <h2 className="mt-3 font-serif text-[clamp(2.3rem,5vw,3.6rem)] leading-[1] tracking-[-0.02em]">{title}</h2>
        <p className="mt-5 max-w-3xl text-[1.05rem] leading-relaxed text-ink-soft sm:text-[1.12rem]">{lead}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function FigureImage({ f, sizes, priority = false, className = "" }: { f: Figure; sizes: string; priority?: boolean; className?: string }) {
  return <Image src={f.src} alt={f.alt} width={f.w} height={f.h} sizes={sizes} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} className={`block h-auto w-full ${className}`} />;
}

function FigureBlock({ f, className = "" }: { f: Figure; className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
        <FigureImage f={f} sizes="(min-width: 1024px) 560px, 100vw" />
      </div>
      {f.caption && <figcaption className="mt-3 text-[0.9rem] text-ink-soft">{f.caption}</figcaption>}
    </figure>
  );
}
