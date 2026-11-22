import Image from "next/image";
import type { Project } from "@/lib/projects";

/**
 * A project's cover. Uses the real image when one exists; otherwise a
 * generated cover in the site's language (dark glass, a tinted nucleus glow,
 * an orbit line, the name set in the display serif) so the layout never looks
 * unfinished while the real covers are being prepared.
 */
export default function ProjectCover({ project, index, sizes = "300px" }: { project: Project; index: number; sizes?: string }) {
  if (project.image) {
    return <Image src={project.image} alt="" fill sizes={sizes} className="object-cover" />;
  }
  const h = project.hue;
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(120% 90% at 78% 18%, hsl(${h} 70% 55% / 0.55), transparent 55%), radial-gradient(90% 80% at 10% 110%, hsl(${(h + 40) % 360} 60% 35% / 0.5), transparent 60%), linear-gradient(160deg, #0d1733, #060b1a)`,
      }}
    >
      {/* orbit line + electron */}
      <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 size-full opacity-70">
        <ellipse cx="112" cy="34" rx="58" ry="17" transform="rotate(-14 112 34)" fill="none" stroke={`hsl(${h} 80% 80% / 0.35)`} strokeWidth="0.5" />
        <circle cx="62" cy="48" r="1.3" fill={`hsl(${h} 90% 85%)`} />
      </svg>
      {/* fine grid, like a blueprint */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <span className="absolute left-[7%] top-[9%] font-mono text-[9px] uppercase tracking-[0.2em] text-white/55">{String(index + 1).padStart(2, "0")}</span>
      <span className="absolute bottom-[9%] left-[7%] font-serif text-[clamp(1.4rem,9cqw,2.6rem)] leading-none tracking-[-0.02em] text-on-cta">{project.name}</span>
    </div>
  );
}
