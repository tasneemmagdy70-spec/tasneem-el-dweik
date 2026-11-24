import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans } from "next/font/google";
import { CASE_STUDIES, caseStudy } from "@/lib/case-studies";
import { FEATURED } from "@/lib/projects";
import { BTN_PRIMARY_MD, BTN_PRIMARY_MD_ICON } from "@/lib/ui";
import { ArrowUpRight } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import CaseProgress from "@/components/case/CaseProgress";
import Reveal from "@/components/case/Reveal";

// NOVU's own typeface, for its design-system specimen
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

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
  { id: "decisions", label: "Decisions" },
  { id: "system", label: "Design system" },
  { id: "screens", label: "Screens" },
];

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
      {/* ── top bar: home, back to the work, the theme — and where you are in the story ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-script text-[1.7rem] leading-none text-ink transition-colors hover:text-blue-glow" aria-label="El-Dweik — home">
            El-Dweik
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/#best-work" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.9rem] text-ink-soft transition-colors hover:text-ink">
              <span aria-hidden>←</span> All work
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <CaseProgress sections={SECTIONS} />
      </header>

      <main>
        {/* ── 1 · Overview: name, one line, three facts, the cover ── */}
        <section id="overview" className="scroll-mt-28 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:pb-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="flex items-center gap-3 font-mono text-[11px] uppercase text-blue-glow">
                <span>
                  {c.n} / {String(FEATURED.length).padStart(2, "0")}
                </span>
                <span className="h-px w-8 bg-blue-glow/50" />
                <span className="text-ink-soft">{c.readTime}</span>
              </p>
              <h1 className="mt-4 font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.92] tracking-[-0.02em]">{c.name}</h1>
              <p className="mt-5 max-w-2xl text-[1.15rem] leading-snug text-ink-soft sm:text-[1.35rem]">{c.tagline}</p>
              <ul className="mt-7 flex flex-wrap gap-2">
                {c.chips.map((x) => (
                  <li key={x} className="rounded-full border border-white/12 px-4 py-2 text-[0.9rem] text-ink">
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} className="mt-14">
              {/* the cover, held in the same folder as on the home page */}
              <div className="folder relative">
                <span
                  aria-hidden
                  className="folder-fill absolute left-0 flex w-[34%] items-center rounded-t-[16px] px-5 font-mono text-[12px] font-semibold text-sand sm:w-[22%]"
                  style={{ top: -30, height: 31 }}
                >
                  {c.n}
                </span>
                <span aria-hidden className="folder-notch absolute left-[34%] size-4 sm:left-[22%]" style={{ top: -16 }} />
                <div className="folder-fill rounded-[24px] rounded-tl-none p-2.5 sm:p-3">
                  <Image
                    src={c.cover.src}
                    alt={c.cover.alt}
                    width={c.cover.w}
                    height={c.cover.h}
                    sizes="(min-width: 1152px) 1120px, 100vw"
                    loading="eager"
                    fetchPriority="high"
                    className="block h-auto w-full rounded-[16px]"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 2 · The problem — one sentence, the words that matter lit ── */}
        <Band id="problem" n="01" label="The problem">
          <Reveal>
            <p className="max-w-4xl font-serif text-[clamp(2rem,5vw,3.6rem)] leading-[1.08] tracking-[-0.015em]">
              {c.problem.before}
              <span className="italic text-blue-glow">{c.problem.lit}</span>
              {c.problem.after}
            </p>
            <p className="mt-8 max-w-2xl border-l-2 border-sand pl-5 text-[1.05rem] italic leading-relaxed text-ink-soft">“{c.problem.quote}”</p>
          </Reveal>
        </Band>

        {/* ── 3 · Three decisions — a picture and one line of "why" each (swipe on phones) ── */}
        <Band id="decisions" n="02" label="Key decisions">
          <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            {c.decisions.map((d, i) => (
              <li key={d.title} className="w-[82%] shrink-0 snap-start sm:w-[58%] lg:w-auto">
                <Reveal delay={i * 100} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/60">
                    <div className="relative aspect-[4/3] bg-white">
                      <Image src={d.figure.src} alt={d.figure.alt} fill sizes="(min-width: 1024px) 360px, 80vw" className="object-cover object-top" />
                    </div>
                    <div className="p-6">
                      <p className="font-mono text-[11px] uppercase text-blue-glow">0{i + 1}</p>
                      <h3 className="mt-2 font-serif text-[1.65rem] leading-tight">{d.title}</h3>
                      <p className="mt-2.5 text-[1rem] leading-relaxed text-ink-soft">{d.why}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </Band>

        {/* ── 4 · Design system — shown, not described ── */}
        <Band id="system" n="03" label="Design system">
          <Reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {c.system.colors.map((col) => (
                <div key={col.hex} className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="flex aspect-[4/3] items-end p-4" style={{ background: col.hex, color: col.ink === "dark" ? "#252325" : "#ffffff" }}>
                    <span className="font-mono text-[12px] font-semibold uppercase">{col.hex}</span>
                  </div>
                  <p className="px-4 py-3 text-[0.9rem] text-ink-soft">{col.name}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
              <div className="flex flex-col justify-between rounded-2xl border border-white/10 p-6 sm:p-8">
                <div className={plex.className}>
                  <p className="text-[4.5rem] font-bold leading-none text-[#895CDD]">Aa</p>
                  <p className="mt-3 text-[1.2rem] font-bold">{c.system.font}</p>
                  <div className="mt-5 space-y-1.5">
                    {c.system.sizes.map((s) => (
                      <p key={s} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-1.5">
                        <span style={{ fontSize: Math.min(s, 28) }} className="leading-tight">
                          {s >= 32 ? "Big" : s >= 24 ? "Normal" : s >= 20 ? "Medium" : "Small"} text
                        </span>
                        <span className="font-mono text-[11px] text-ink-soft">{s}px</span>
                      </p>
                    ))}
                  </div>
                </div>
                <ul className="mt-6 space-y-1 text-[0.92rem] text-ink-soft">
                  {c.system.notes.map((x) => (
                    <li key={x}>· {x}</li>
                  ))}
                </ul>
              </div>
              {/* the components, cropped from the system sheet */}
              <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-white">
                <Image
                  src={c.system.components.src}
                  alt={c.system.components.alt}
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover object-[center_95%]"
                />
              </div>
            </div>
          </Reveal>
        </Band>

        {/* ── 5 · Screens — side by side on desktop, a strip to swipe on phones ── */}
        <Band id="screens" n="04" label="Final screens">
          <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            {c.screens.map((s, i) => (
              <li key={s.src} className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-auto">
                <Reveal delay={i * 100}>
                  <figure>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white">
                      <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 460px, 82vw" className="object-cover object-top" />
                    </div>
                    <figcaption className="mt-3 font-mono text-[11px] uppercase text-ink-soft">{s.caption}</figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </Band>

        {/* ── 6 · Impact in numbers, then where to go next ── */}
        <section className="border-t border-white/[0.06] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
                {c.impact.map((x) => (
                  <div key={x.label}>
                    <dt className="sr-only">{x.label}</dt>
                    <dd>
                      <span className="block font-serif text-[clamp(3rem,7vw,4.75rem)] leading-none text-ink">{x.value}</span>
                      <span className="mt-2 block text-[0.95rem] text-ink-soft">{x.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={100} className="mt-20">
              <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-panel/60 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
                <p className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-tight">The full process is on Behance.</p>
                <a href={c.behance} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY_MD}>
                  Open on Behance
                  <span className={BTN_PRIMARY_MD_ICON}>
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </a>
              </div>
              <nav aria-label="More work" className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link href="/#best-work" className="rounded-2xl border border-white/10 p-6 transition-colors hover:border-blue-glow/50">
                  <p className="font-mono text-[11px] uppercase text-ink-soft">← Back</p>
                  <p className="mt-2 text-[1.15rem] font-semibold">All best work</p>
                </Link>
                <a
                  href={nextHref}
                  {...(nextExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="rounded-2xl border border-white/10 p-6 text-right transition-colors hover:border-blue-glow/50"
                >
                  <p className="font-mono text-[11px] uppercase text-ink-soft">Next project →</p>
                  <p className="mt-2 text-[1.15rem] font-semibold">{nextProject.name}</p>
                </a>
              </nav>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-center font-mono text-[11px] uppercase text-ink-soft sm:px-8">© 2026 Tasneem El-Dweik</footer>
    </div>
  );
}

/** One section: a small number + label, then its content — no paragraphs of intro. */
function Band({ id, n, label, children }: { id: string; n: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/[0.06] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase text-blue-glow">
          <span>{n}</span>
          <span className="h-px w-8 bg-blue-glow/50" />
          <span className="text-ink-soft">{label}</span>
        </p>
        {children}
      </div>
    </section>
  );
}
