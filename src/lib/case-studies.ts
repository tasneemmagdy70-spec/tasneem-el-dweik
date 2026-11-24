/**
 * Case studies, read inside the portfolio — the highlights only (about 150 words, mostly
 * pictures). The full process lives on Behance, one tap away, for anyone who wants it.
 * Each project is the same shape, so adding the next one is only content.
 */

export type Figure = { src: string; w: number; h: number; alt: string };

export type CaseStudy = {
  slug: string;
  n: string; // its number among the featured projects
  name: string;
  tagline: string; // ≤ 12 words
  behance: string;
  chips: string[]; // role · platforms · type
  readTime: string;
  cover: Figure;
  /** the problem in one sentence, with the words that matter lit */
  problem: { before: string; lit: string; after: string; quote: string };
  decisions: { title: string; why: string; figure: Figure }[];
  system: {
    colors: { hex: string; name: string; ink?: "light" | "dark" }[];
    font: string;
    sizes: number[];
    notes: string[]; // e.g. grid, icons
    components: Figure; // the components sheet (shown cropped)
  };
  screens: (Figure & { caption: string })[];
  impact: { value: string; label: string }[];
};

const IMG = "/images/work/novu";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "novu",
    n: "01",
    name: "NOVU",
    tagline: "A guided path into tech: one roadmap, an AI mentor, real practice.",
    behance: "https://www.behance.net/gallery/254132483/NOVU-AI-Powered-Tech-Career-Roadmap-Platform",
    chips: ["UX research · UI design", "Mobile · Web · Dashboard", "ITI graduation project"],
    readTime: "2 min read",
    cover: { src: `${IMG}/cover.webp`, w: 1400, h: 788, alt: "NOVU — Learn Tech. Build Your Future. The NOVU app on a phone." },
    problem: {
      before: "Learners aren't short of content — they're ",
      lit: "lost without a clear path",
      after: ", so they stall and quit.",
      quote: "Online courses are everywhere, but they feel like a lonely desert.",
    },
    decisions: [
      {
        title: "A roadmap, not a catalogue",
        why: "Too many choices froze learners. One guided path removes the guesswork.",
        figure: { src: `${IMG}/ai-features.webp`, w: 1400, h: 1089, alt: "NOVA, the AI companion that builds a personal roadmap." },
      },
      {
        title: "Progress you can see",
        why: "Motivation dropped when progress was invisible. Streaks and XP make every step count.",
        figure: { src: `${IMG}/game-mechanics.webp`, w: 1400, h: 970, alt: "Game mechanics: streaks, XP, badges and unlockable tracks." },
      },
      {
        title: "Learn by doing",
        why: "Learners trusted only what they'd practised — so every path ends in real projects.",
        figure: { src: `${IMG}/mobile-ui.webp`, w: 1400, h: 2126, alt: "NOVU screens: practice hub, quizzes and mentor review." },
      },
    ],
    system: {
      colors: [
        { hex: "#895CDD", name: "Primary", ink: "light" },
        { hex: "#252325", name: "Deep Charcoal", ink: "light" },
        { hex: "#FAF9FA", name: "Snow White", ink: "dark" },
        { hex: "#D5D2D5", name: "Grey · 16 shades", ink: "dark" },
      ],
      font: "IBM Plex Sans",
      sizes: [32, 24, 20, 14],
      notes: ["4-col mobile · 12-col desktop grid", "40+ icons"],
      components: { src: `${IMG}/design-system.webp`, w: 1400, h: 3097, alt: "NOVU components: navigation, buttons, badges, inputs, tabs and progress." },
    },
    screens: [
      { src: `${IMG}/mobile-ui.webp`, w: 1400, h: 2126, alt: "NOVU mobile app screens.", caption: "Mobile app" },
      { src: `${IMG}/web-ui.webp`, w: 1400, h: 1601, alt: "NOVU web app screens.", caption: "Web app" },
      { src: `${IMG}/dashboard.webp`, w: 1400, h: 1603, alt: "NOVU admin dashboard.", caption: "Admin dashboard" },
    ],
    impact: [
      { value: "80+", label: "screens designed" },
      { value: "3", label: "platforms" },
      { value: "40+", label: "icons" },
      { value: "1", label: "AI mentor, NOVA" },
    ],
  },
];

export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
