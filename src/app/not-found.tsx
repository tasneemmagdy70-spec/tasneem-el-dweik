import Link from "next/link";
import ContactAtom from "@/components/ContactAtom";

export const metadata = { title: "Lost beneath the surface — Tasneem El-Dweik" };

/**
 * A wrong link shouldn't feel like a dead end: same water, same atom, one clear way back.
 */
export default function NotFound() {
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-paper px-6 text-center">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-12%,rgb(var(--rgb-bright)/0.32),transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(120vw,46rem)] -translate-x-1/2 -translate-y-1/2 opacity-50">
        <ContactAtom charged={false} className="w-full" />
      </div>

      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">
          <span className="text-blue-glow">404</span> · depth unknown
        </p>
        <h1 className="mt-5 font-serif text-[clamp(2.6rem,8vw,5rem)] leading-[1] tracking-[-0.02em] text-ink">
          Lost beneath
          <br />
          the <span className="italic text-blue-glow">surface</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-[26rem] text-[1rem] leading-relaxed text-ink-soft">
          This page doesn&apos;t exist — maybe the link was mistyped, or it moved. Everything I&apos;ve made is one dive away.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-11 items-center gap-2.5 rounded-full bg-cta py-1.5 pl-5 pr-1.5 text-[0.95rem] font-medium text-on-cta transition-colors hover:bg-cta-hover"
        >
          Back to the surface
          <span className="grid size-8 place-items-center rounded-full bg-on-cta text-blue">↑</span>
        </Link>
      </div>
    </main>
  );
}
