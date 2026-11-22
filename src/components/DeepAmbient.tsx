/**
 * The dive keeps going below the hero: a soft pool of light in the section's own
 * colours and a few particles drifting up, like the water column in the hero —
 * quieter, so the content still leads. Pure CSS; respects reduced motion.
 */

type Light = { color: string; x: string; y: string; size?: string; opacity?: number };

// deterministic "random" so server and client render the same particles
const rand = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export default function DeepAmbient({ lights, particles = 18, seed = 1 }: { lights: Light[]; particles?: number; seed?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {lights.map((l, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            left: l.x,
            top: l.y,
            width: l.size ?? "46rem",
            height: l.size ?? "46rem",
            background: `radial-gradient(circle, ${l.color}, transparent 65%)`,
            opacity: `calc(${l.opacity ?? 0.14} * var(--ambient-boost))`,
          }}
        />
      ))}
      {Array.from({ length: particles }, (_, i) => {
        const size = 1 + Math.round(rand(i, seed) * 2);
        return (
          <span
            key={i}
            className="deep-particle absolute rounded-full bg-blue-glow"
            style={{
              left: `${(rand(i, seed + 1) * 100).toFixed(2)}%`,
              top: `${(rand(i, seed + 2) * 100).toFixed(2)}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: (0.15 + rand(i, seed + 3) * 0.35).toFixed(2),
              animationDuration: `${(14 + rand(i, seed + 4) * 16).toFixed(1)}s`,
              animationDelay: `${(-rand(i, seed + 5) * 20).toFixed(1)}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** "05 — More work · -420m": the depth keeps counting below the hero. */
export function DepthTag({ n, name, depth }: { n: string; name: string; depth: string }) {
  return (
    <p className="mb-3 flex items-center font-mono text-[10px] uppercase tracking-[0.3em] text-blue-glow sm:text-[11px]">
      {n} <span className="mx-2 inline-block h-px w-8 bg-blue-glow/50" /> <span className="text-ink-soft">{name}</span>
      <span className="ml-3 tracking-[0.12em] text-ink-soft tabular-nums">{depth}</span>
    </p>
  );
}
