import type { Metadata, Viewport } from "next";
import { Corinthia, Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { THEME_BOOT } from "@/lib/theme-boot";

const inter = Inter({
  variable: "--nf-inter",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--nf-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const script = Corinthia({
  variable: "--nf-script",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Technical voice: depth readouts, x-ray annotations, labels.
const mono = JetBrains_Mono({
  variable: "--nf-mono",
  subsets: ["latin"],
});

// The live address: link previews (LinkedIn, WhatsApp…) need absolute image URLs.
// If the site goes live on another domain, change it here (and the link in the CV).
const SITE = "https://tasneem-el-dweik.vercel.app";
const TITLE = "Tasneem El-Dweik — UI/UX & Product Designer";
const DESCRIPTION = "UI/UX & Product Designer. Designing for the why behind every click — research first, then every color, word and click has to earn its place.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: "website", url: SITE, siteName: "Tasneem El-Dweik", title: TITLE, description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// the browser chrome on phones matches the water (dark) or the daylight (light)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050a18" },
    { media: "(prefers-color-scheme: light)", color: "#e8eefc" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} ${script.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* applies the saved theme before first paint — no flash of the wrong one */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
