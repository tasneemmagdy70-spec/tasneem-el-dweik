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
  /** the final screens, exported from the Figma file, grouped by platform */
  screens: { mobile: Figure[]; web: Figure[]; dashboard: Figure[] };
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
    screens: {
      mobile: [
        { src: `${IMG}/screens/m-home.webp`, w: 750, h: 1624, alt: "Home: the learner's roadmap, level by level." },
        { src: `${IMG}/screens/m-mentor.webp`, w: 750, h: 1624, alt: "NOVA, the AI mentor, asking what brings the learner to the app." },
        { src: `${IMG}/screens/m-quiz.webp`, w: 750, h: 1624, alt: "A timed quiz question with four answers." },
        { src: `${IMG}/screens/m-streak.webp`, w: 750, h: 1624, alt: "Streak calendar: current and best streak." },
        { src: `${IMG}/screens/m-practice.webp`, w: 750, h: 1624, alt: "Practice hub: challenges in progress, by module." },
      ],
      web: [
        { src: `${IMG}/screens/w-home.webp`, w: 1440, h: 1024, alt: "NOVU web app: the roadmap with your progress beside it." },
        { src: `${IMG}/screens/w-lesson.webp`, w: 1440, h: 1024, alt: "NOVU web app: a video lesson with notes and discussion." },
      ],
      dashboard: [
        { src: `${IMG}/screens/d-overview.webp`, w: 1440, h: 1024, alt: "Admin dashboard: users, active learners and popular paths." },
        { src: `${IMG}/screens/d-paths.webp`, w: 1440, h: 1024, alt: "Admin dashboard: managing career paths and their status." },
      ],
    },
    impact: [
      { value: "80+", label: "screens designed" },
      { value: "3", label: "platforms" },
      { value: "40+", label: "icons" },
      { value: "1", label: "AI mentor, NOVA" },
    ],
  },
];

export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
