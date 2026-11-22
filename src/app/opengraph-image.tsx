import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The link preview (LinkedIn, WhatsApp, Slack, X…): the first screen of the portfolio in
 * one frame — the promise on the left, the portrait rising out of the atom on the right.
 */
export const alt = "Tasneem El-Dweik — UI/UX & Product Designer. Designing for the why behind every click.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** one orbital lobe of the hero's atom (gradients g-60 / g0 / g60 below) */
const LOBE = (rot: number, a: number) => (
  <ellipse key={rot} cx="0" cy="0" rx="250" ry="114" transform={`rotate(${rot})`} fill={`url(#g${rot})`} opacity={a} />
);

// Everything comes from the project itself (Instrument Serif is bundled under og-fonts, SIL Open
// Font License), read once at module load — no network, no request-time data — so the image is
// generated once at build time and served as a static file.
const [portrait, regular, italic] = await Promise.all([
  readFile(join(process.cwd(), "public/images/tasneem-v5.png")),
  readFile(join(process.cwd(), "src/app/og-fonts/InstrumentSerif-Regular.ttf")),
  readFile(join(process.cwd(), "src/app/og-fonts/InstrumentSerif-Italic.ttf")),
]);

export default async function OpengraphImage() {
  const photo = `data:image/png;base64,${portrait.toString("base64")}`;
  const fonts = [
    { name: "Serif", data: regular, style: "normal" as const, weight: 400 as const },
    { name: "Serif", data: italic, style: "italic" as const, weight: 400 as const },
  ];
  const display = "Serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#050a18",
          backgroundImage: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(76,114,240,0.35), transparent 70%)",
          color: "#e9eefa",
          overflow: "hidden",
        }}
      >
        {/* left: who, the promise, what */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 640, paddingLeft: 80 }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 6, color: "#8c99bc", textTransform: "uppercase" }}>Tasneem El-Dweik</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontFamily: display, fontSize: 82, lineHeight: 1, letterSpacing: -1.5 }}>
            <span>Designing for</span>
            <span style={{ display: "flex" }}>
              the&nbsp;<span style={{ fontStyle: "italic", color: "#8fa8ff", borderBottom: "4px solid #d4b48c", lineHeight: 0.92 }}>why</span>&nbsp;behind
            </span>
            <span>every click.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 40, fontSize: 24, color: "#8c99bc" }}>
            <div style={{ width: 36, height: 2, background: "#8fa8ff", marginRight: 16 }} />
            UI/UX &amp; Product Designer
          </div>
        </div>

        {/* right: the atom, with the portrait rising out of it */}
        <div style={{ position: "absolute", right: 20, top: 0, width: 560, height: 630, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              width: 520,
              height: 520,
              top: 110,
              left: 20,
              borderRadius: 9999,
              background: "radial-gradient(circle, rgba(76,114,240,0.32), transparent 65%)",
            }}
          />
          <svg width="560" height="560" viewBox="-280 -280 560 560" style={{ position: "absolute", top: 100, left: 0 }}>
            <defs>
              <linearGradient id="g0" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4c72f0" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="g-60" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8fa8ff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="g60" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#2f55c7" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#0f1f5c" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <ellipse cx="0" cy="0" rx="270" ry="86" transform="rotate(-16)" fill="none" stroke="rgba(143,168,255,0.35)" strokeWidth="1.5" />
            <ellipse cx="0" cy="0" rx="262" ry="122" transform="rotate(24)" fill="none" stroke="rgba(143,168,255,0.25)" strokeWidth="1.5" />
            {LOBE(-60, 0.85)}
            {LOBE(60, 0.85)}
            {LOBE(0, 0.9)}
            <circle cx="236" cy="-64" r="7" fill="#d4b48c" />
            <circle cx="-214" cy="96" r="6" fill="#e9eefa" />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not a page */}
          <img src={photo} width={350} height={518} style={{ position: "absolute", top: 70, left: 105 }} alt="" />
        </div>
        {/* the portrait dissolves into the water, as on the site (full width: no visible edge) */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 170, background: "linear-gradient(to bottom, rgba(5,10,24,0), #050a18 85%)" }} />
      </div>
    ),
    { ...size, fonts },
  );
}
