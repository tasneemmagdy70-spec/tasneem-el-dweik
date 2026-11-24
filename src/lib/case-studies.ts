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
  /** the UX work, phase by phase (design thinking), with the artifact that shows it */
  process: {
    stats: { value: string; label: string }[];
    phases: { name: string; methods: string[]; figure: Figure }[];
    insights: { title: string; body: string }[];
  };
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
  screens: {
    /** mobile, as user flows: each a few screens in the order you meet them */
    mobile: { title: string; note: string; shots: Figure[] }[];
    /** web size and dashboard, as one collection each — the first screen leads */
    web: Figure[];
    dashboard: Figure[];
    /** how many screens each platform has in total (only some are shown) */
    totals: { mobile: string; web: string; dashboard: string };
  };
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
    chips: ["UX research", "UI design", "Mobile app", "Web", "Admin dashboard", "AI mentor", "Gamification", "Design system", "Usability testing", "ITI graduation project"],
    readTime: "2 min read",
    cover: { src: `${IMG}/cover.webp`, w: 1400, h: 788, alt: "NOVU — Learn Tech. Build Your Future. The NOVU app on a phone." },
    problem: {
      before: "Learners aren't short of content — they're ",
      lit: "lost without a clear path",
      after: ", so they stall and quit.",
      quote: "Online courses are everywhere, but they feel like a lonely desert.",
    },
    process: {
      stats: [
        { value: "5", label: "platforms analysed" },
        { value: "8", label: "research patterns" },
        { value: "9", label: "users in testing" },
        { value: "3", label: "fixes after testing" },
      ],
      phases: [
        {
          name: "Empathize",
          methods: ["Stakeholder interviews", "User research", "Competitive analysis", "SWOT analysis"],
          figure: { src: `${IMG}/ux/interviews.webp`, w: 1400, h: 2351, alt: "Stakeholder interview questions and the eight insights they produced." },
        },
        {
          name: "Define",
          methods: ["Affinity map", "Empathy map", "Persona", "User journey", "Problem statement"],
          figure: { src: `${IMG}/ux/affinity-map.webp`, w: 1400, h: 1196, alt: "Affinity map grouping research notes into eight patterns." },
        },
        {
          name: "Ideate",
          methods: ["Brainstorming", "Priority matrix", "Value proposition", "Gamification strategy"],
          figure: { src: `${IMG}/ux/priority-matrix.webp`, w: 1400, h: 1254, alt: "Impact / effort priority matrix for NOVU's features." },
        },
        {
          name: "Prototype",
          methods: ["Information architecture", "User flows", "Wireframes", "Design system"],
          figure: { src: `${IMG}/ux/wireframes.webp`, w: 1400, h: 2120, alt: "Mid-fidelity wireframes of the NOVU mobile app." },
        },
        {
          name: "Test",
          methods: ["Usability testing · 9 users", "Remote, unmoderated (Maze)", "Before → after fixes"],
          figure: { src: `${IMG}/ux/usability-testing.webp`, w: 1400, h: 2997, alt: "Usability testing plan and three before / after design fixes." },
        },
      ],
      insights: [
        { title: "Direction is the real problem", body: "Learners aren't stuck for content, but for a clear place to start." },
        { title: "No feedback, no confidence", body: "Without validation they keep asking if they're on the right track." },
        { title: "Progress drives motivation", body: "When progress can't be seen, learners drop the course." },
      ],
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
        {
          title: "Getting started",
          note: "From first launch to a mentor that asks what you need.",
          shots: [
            { src: `${IMG}/screens/m-splash.webp`, w: 750, h: 1624, alt: "Splash screen with the NOVU logo." },
            { src: `${IMG}/screens/m-onboarding.webp`, w: 750, h: 1624, alt: "Onboarding: from confusion to clarity." },
            { src: `${IMG}/screens/m-signup.webp`, w: 750, h: 1624, alt: "Create account." },
            { src: `${IMG}/screens/m-mentor.webp`, w: 750, h: 1624, alt: "NOVA, the AI mentor, asking what brings you here." },
          ],
        },
        {
          title: "Learning path",
          note: "A roadmap, a track, a lesson, then a quiz to prove it.",
          shots: [
            { src: `${IMG}/screens/m-home.webp`, w: 750, h: 1624, alt: "Home: the roadmap, level by level." },
            { src: `${IMG}/screens/m-track.webp`, w: 750, h: 1624, alt: "Track details with its levels and courses." },
            { src: `${IMG}/screens/m-lesson.webp`, w: 750, h: 1624, alt: "A video lesson with notes and discussion." },
            { src: `${IMG}/screens/m-quiz.webp`, w: 750, h: 1624, alt: "A timed quiz question." },
          ],
        },
        {
          title: "Practice & rewards",
          note: "Challenges, streaks and badges that keep learners coming back.",
          shots: [
            { src: `${IMG}/screens/m-practice.webp`, w: 750, h: 1624, alt: "Practice hub: challenges in progress." },
            { src: `${IMG}/screens/m-streak.webp`, w: 750, h: 1624, alt: "Streak calendar." },
            { src: `${IMG}/screens/m-reward.webp`, w: 750, h: 1624, alt: "Claim the weekly reward." },
            { src: `${IMG}/screens/m-achieve.webp`, w: 750, h: 1624, alt: "Achievements and earned badges." },
          ],
        },
      ],
      web: [
        { src: `${IMG}/screens/w-home.webp`, w: 1440, h: 1024, alt: "Web: the roadmap with your progress beside it." },
        { src: `${IMG}/screens/w-lesson.webp`, w: 1440, h: 1024, alt: "Web: a video lesson." },
        { src: `${IMG}/screens/w-quiz.webp`, w: 1440, h: 1024, alt: "Web: a quiz with instant feedback." },
        { src: `${IMG}/screens/w-discuss.webp`, w: 1440, h: 1024, alt: "Web: lesson discussion." },
        { src: `${IMG}/screens/w-notes.webp`, w: 1440, h: 1024, alt: "Web: lesson notes and cheat sheet." },
        { src: `${IMG}/screens/w-tracks.webp`, w: 1440, h: 1024, alt: "Web: my learning tracks." },
        { src: `${IMG}/screens/w-project.webp`, w: 1440, h: 1024, alt: "Web: my projects." },
        { src: `${IMG}/screens/w-profile.webp`, w: 1440, h: 1024, alt: "Web: profile, tracks and projects." },
        { src: `${IMG}/screens/w-achieve.webp`, w: 1440, h: 1024, alt: "Web: achievements and badges." },
      ],
      dashboard: [
        { src: `${IMG}/screens/d-overview.webp`, w: 1440, h: 1024, alt: "Dashboard: users, learners and popular paths." },
        { src: `${IMG}/screens/d-paths.webp`, w: 1440, h: 1024, alt: "Dashboard: managing career paths." },
        { src: `${IMG}/screens/d-63.webp`, w: 1440, h: 1024, alt: "Dashboard: the roadmap builder." },
        { src: `${IMG}/screens/d-72.webp`, w: 1440, h: 1024, alt: "Dashboard: learners and their progress." },
        { src: `${IMG}/screens/d-73.webp`, w: 1440, h: 1024, alt: "Dashboard: subscriptions and plans." },
        { src: `${IMG}/screens/d-71.webp`, w: 1440, h: 1024, alt: "Dashboard: rewards and progression." },
        { src: `${IMG}/screens/d-67.webp`, w: 1440, h: 1024, alt: "Dashboard: AI mentor control." },
        { src: `${IMG}/screens/d-70.webp`, w: 1440, h: 1024, alt: "Dashboard: practice hub tasks." },
      ],
      totals: { mobile: "50+", web: "30+", dashboard: "8" },
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
