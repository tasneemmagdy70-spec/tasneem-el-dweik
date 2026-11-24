/**
 * Case studies, read inside the portfolio — the highlights only (about 150 words, mostly
 * pictures). The full process lives on Behance, one tap away, for anyone who wants it.
 * Each project is the same shape, so adding the next one is only content.
 */

import { NOVU_ICONS } from "./novu-icons";

export type Figure = { src: string; w: number; h: number; alt: string };
export type Icon = { name: string; viewBox: string; body: string };

export type CaseStudy = {
  slug: string;
  n: string; // its number among the featured projects
  name: string;
  tagline: string; // ≤ 12 words
  behance: string;
  chips: string[]; // role · platforms · type
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
  /** the design system as spec cards: colour and type always; the rest when the project has them */
  system: {
    colors: { hex: string; name: string }[]; // the first is the brand colour
    font: string;
    sizes?: number[]; // the type scale…
    weights?: { name: string; value: number }[]; // …or the weights in use
    grid?: { mobile: Figure; desktop: Figure }; // real screens, the column grid drawn over them
    icons?: { set: Icon[]; note: string };
    components?: Figure; // the components sheet (shown cropped)
    brand?: Figure; // the logo / identity, shown wide
  };
  /** the final screens, exported from the Figma file, grouped by platform */
  screens: {
    /** mobile, as user flows: each a few screens in the order you meet them */
    mobile: { title: string; note: string; shots: Figure[] }[];
    /** web size and dashboard, as one collection each — the first screen leads */
    web?: Figure[];
    dashboard?: Figure[];
    /** how many screens each platform has in total (only some are shown) */
    totals: { mobile: string; web?: string; dashboard?: string };
  };
  impact: { value: string; label: string }[];
};

const IMG = "/images/work/novu";
const SANAA = "/images/work/sanaa";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "novu",
    n: "01",
    name: "NOVU",
    tagline: "A guided path into tech: one roadmap, an AI mentor, real practice.",
    behance: "https://www.behance.net/gallery/254132483/NOVU-AI-Powered-Tech-Career-Roadmap-Platform",
    chips: ["UX research", "UI design", "Mobile app", "Web", "Admin dashboard", "AI mentor", "Gamification", "Design system", "Usability testing", "ITI graduation project"],
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
        { hex: "#895CDD", name: "Primary" },
        { hex: "#252325", name: "Deep Charcoal" },
        { hex: "#FAF9FA", name: "Snow White" },
        { hex: "#D5D2D5", name: "Grey" },
      ],
      font: "IBM Plex Sans",
      sizes: [32, 24, 20, 14],
      grid: {
        mobile: { src: `${IMG}/screens/m-quiz.webp`, w: 750, h: 1624, alt: "" },
        desktop: { src: `${IMG}/screens/w-lesson.webp`, w: 1440, h: 1024, alt: "" },
      },
      icons: { set: NOVU_ICONS, note: "40+ icons in one stroke style" },
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
  {
    slug: "sanaa",
    n: "02",
    name: "Sana'a",
    tagline: "Book real handcraft workshops, with the tools, level and date clear upfront.",
    behance: "https://www.behance.net/gallery/245083381/Sanaa-Handcrafts-Booking-UXUI-Case-Study",
    chips: ["UX research", "UI design", "Mobile app", "Phygital booking", "Survey", "User interviews", "Focus group", "Competitive analysis", "Card sorting", "ITI project"],
    cover: { src: `${SANAA}/identity.webp`, w: 980, h: 500, alt: "Sana'a: the صنعة calligraphy logo on a geometric pattern." },
    process: {
      stats: [
        { value: "9", label: "survey responses" },
        { value: "5", label: "1-on-1 interviews" },
        { value: "9", label: "platforms analysed" },
        { value: "50+", label: "statements mapped" },
      ],
      phases: [
        {
          name: "Empathize",
          methods: ["Stakeholder interviews", "Survey", "1-on-1 interviews", "Gen-Z focus group"],
          figure: { src: `${SANAA}/ux/survey.webp`, w: 1400, h: 1701, alt: "Survey results: how learners find, book and budget for craft workshops." },
        },
        {
          name: "Define",
          methods: ["Affinity map", "Personas", "Empathy map", "User journey"],
          figure: { src: `${SANAA}/ux/affinity-map.webp`, w: 1400, h: 2657, alt: "Affinity map: 50+ statements in five pillars." },
        },
        {
          name: "Ideate",
          methods: ["Competitive analysis", "SWOT analysis", "Features list", "Card sorting"],
          figure: { src: `${SANAA}/ux/competitive-analysis.webp`, w: 1400, h: 2479, alt: "Competitors' strengths and weaknesses, and the SWOT analysis." },
        },
        {
          name: "Prototype",
          methods: ["Information architecture", "User flow", "Style guide", "High-fidelity UI"],
          figure: { src: `${SANAA}/ux/information-architecture.webp`, w: 1400, h: 3549, alt: "Information architecture of the Sana'a app." },
        },
      ],
      insights: [
        { title: "Videos can't correct you", body: "Learners want a mentor who catches mistakes before they become habits." },
        { title: "Tools are a knowledge gap", body: "Good supplies are hard to find, so they want them with the course." },
        { title: "Waiting kills interest", body: "A fixed start date matters more than a waiting list." },
      ],
    },
    problem: {
      before: "Handcrafts are thriving, but booking is ",
      lit: "stuck in social-media DMs",
      after: ", with unclear tools, levels and dates.",
      quote: "I messaged them on Monday and they replied on Friday.",
    },
    decisions: [
      {
        title: "Book in a tap, not a DM",
        why: "Level, schedule, place and price sit on the course page, so learners can book instantly.",
        figure: { src: `${SANAA}/decisions/booking.webp`, w: 1400, h: 875, alt: "Home and course details: level, schedule, location and price upfront." },
      },
      {
        title: "The kit comes with the seat",
        why: "Sourcing tools was the hidden barrier, so the right kit can be added at checkout.",
        figure: { src: `${SANAA}/decisions/kit.webp`, w: 1400, h: 875, alt: "Marketplace and cart: course tools bought with the booking." },
      },
      {
        title: "A community to keep going",
        why: "Peers keep learners motivated, so they share work, ask and track their courses.",
        figure: { src: `${SANAA}/decisions/community.webp`, w: 1400, h: 875, alt: "Community feed and course progress." },
      },
    ],
    system: {
      colors: [
        { hex: "#349FB3", name: "Teal" },
        { hex: "#A2D3DC", name: "Light teal" },
        { hex: "#C7E5EA", name: "Mist" },
        { hex: "#D0D0D0", name: "Grey" },
        { hex: "#343434", name: "Charcoal" },
      ],
      font: "Inter",
      weights: [
        { name: "Light", value: 300 },
        { name: "Regular", value: 400 },
        { name: "Medium", value: 500 },
        { name: "SemiBold", value: 600 },
        { name: "Bold", value: 700 },
      ],
      brand: { src: `${SANAA}/identity.webp`, w: 980, h: 500, alt: "The صنعة calligraphy logo on an Islamic geometric pattern." },
    },
    screens: {
      mobile: [
        {
          title: "Getting started",
          note: "From the first screen to a verified account.",
          shots: [
            { src: `${SANAA}/screens/m-splash.webp`, w: 390, h: 844, alt: "Splash screen with the صنعة logo." },
            { src: `${SANAA}/screens/m-onboarding.webp`, w: 390, h: 844, alt: "Onboarding: courses, tools, workshops and community." },
            { src: `${SANAA}/screens/m-signup.webp`, w: 390, h: 844, alt: "Create your account." },
            { src: `${SANAA}/screens/m-verify.webp`, w: 390, h: 844, alt: "Verify your email address." },
          ],
        },
        {
          title: "Find & book a workshop",
          note: "Browse, check the details, enroll. No DMs.",
          shots: [
            { src: `${SANAA}/screens/m-home.webp`, w: 390, h: 844, alt: "Home: popular and recommended courses." },
            { src: `${SANAA}/screens/m-courses.webp`, w: 390, h: 844, alt: "Popular courses." },
            { src: `${SANAA}/screens/m-course.webp`, w: 390, h: 844, alt: "Course details: level, schedule, location and price." },
            { src: `${SANAA}/screens/m-paid.webp`, w: 390, h: 844, alt: "Enrolled, with the transaction receipt." },
          ],
        },
        {
          title: "Tools & community",
          note: "Get the right kit, then keep going with others.",
          shots: [
            { src: `${SANAA}/screens/m-market.webp`, w: 390, h: 844, alt: "Marketplace for craft tools." },
            { src: `${SANAA}/screens/m-cart.webp`, w: 390, h: 844, alt: "Cart with tools and delivery to the workshop." },
            { src: `${SANAA}/screens/m-mycourses.webp`, w: 390, h: 844, alt: "My courses and their progress." },
            { src: `${SANAA}/screens/m-community.webp`, w: 390, h: 844, alt: "Community feed to share work and ask." },
          ],
        },
      ],
      totals: { mobile: "40+" },
    },
    impact: [
      { value: "40+", label: "screens designed" },
      { value: "5", label: "research methods" },
      { value: "3", label: "user personas" },
      { value: "1", label: "phygital booking app" },
    ],
  },
];

export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
