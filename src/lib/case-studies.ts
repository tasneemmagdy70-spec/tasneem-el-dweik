/**
 * Case studies, read inside the portfolio (the full Behance case study stays one tap away).
 * Short on purpose: a reviewer gets the problem, the reasoning and the result in ~2 minutes.
 * Each project is the same shape, so adding the next one is only content.
 */

export type Figure = { src: string; w: number; h: number; alt: string; caption?: string };

export type CaseStudy = {
  slug: string;
  n: string; // its number among the featured projects
  name: string;
  tagline: string;
  behance: string;
  facts: { label: string; value: string }[];
  cover: Figure;
  summary: { problem: string; solution: string; outcome: string };
  problem: { statement: string; insights: { title: string; body: string }[]; quote?: { text: string; who: string } };
  research: { intro: string; methods: string[]; figure: Figure };
  decisions: { title: string; why: string; what: string; figure: Figure }[];
  design: { intro: string; figures: Figure[] };
  next: { title: string; body: string }[];
};

const NOVU_IMG = "/images/work/novu";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "novu",
    n: "01",
    name: "NOVU",
    tagline: "An AI-powered learning platform that turns scattered tech resources into one guided path — from “where do I start?” to a job-ready portfolio.",
    behance: "https://www.behance.net/gallery/254132483/NOVU-AI-Powered-Tech-Career-Roadmap-Platform",
    facts: [
      { label: "Type", value: "ITI graduation project" },
      { label: "Role", value: "UX research · Product & UI design" },
      { label: "Platforms", value: "Mobile app · Web app · Admin dashboard" },
      { label: "Tools", value: "Figma · Miro · Photoshop · Trello" },
    ],
    cover: { src: `${NOVU_IMG}/cover.webp`, w: 1400, h: 788, alt: "NOVU — Learn Tech. Build Your Future. The NOVU app shown on a phone." },
    summary: {
      problem:
        "New tech learners aren't short of content — they're overwhelmed by it. With no clear starting point, no feedback and no visible progress, most quit early.",
      solution:
        "One guided roadmap per career path, an AI companion that adapts it to each learner, and real practice with progress you can see.",
      outcome:
        "A complete product: 50+ mobile screens, 30+ web screens, an admin dashboard and a brand identity — designed from research to high-fidelity UI.",
    },
    problem: {
      statement:
        "Users are not struggling with a lack of learning content. They are overwhelmed by the abundance of resources, unclear starting points and the absence of a structured, guided journey — so they face decision paralysis, lose motivation and rarely reach job readiness.",
      insights: [
        { title: "Direction is the core problem", body: "Learners aren't stuck for lack of content, but for lack of a clear starting point and path." },
        { title: "No feedback, no confidence", body: "Without guidance or validation, they keep wondering whether they're progressing the right way." },
        { title: "Motivation follows visible progress", body: "When progress can't be seen or measured, motivation drops — and courses are abandoned." },
      ],
      quote: {
        text: "Online courses are everywhere, but they feel like a lonely desert. I don't want to just stare at videos alone.",
        who: "From the user interviews",
      },
    },
    research: {
      intro:
        "The design started with the business and the people it serves: what the product must achieve, who struggles most, and why existing platforms don't close the gap.",
      methods: [
        "Stakeholder interviews",
        "Competitive analysis · 5 platforms",
        "SWOT analysis",
        "Affinity mapping",
        "Empathy map",
        "Persona & user journey",
      ],
      figure: {
        src: `${NOVU_IMG}/affinity-map.webp`,
        w: 1400,
        h: 1196,
        alt: "Affinity map grouping research notes into themes such as scattered learning, lack of direction and need for feedback.",
        caption: "Affinity map — research notes grouped into the eight patterns that shaped the product.",
      },
    },
    decisions: [
      {
        title: "A roadmap first — not a catalogue",
        why: "Choice was the problem, not content. A long list of courses only adds to the paralysis learners already feel.",
        what: "Each career path opens as one step-by-step roadmap. An AI roadmap builder tailors it to the learner's goal, level and the time they actually have.",
        figure: { src: `${NOVU_IMG}/ai-features.webp`, w: 1400, h: 1089, alt: "NOVA, the AI learning companion: roadmap builder, nudges, refresh sessions and lesson guide." },
      },
      {
        title: "Progress you can see, every day",
        why: "Motivation dropped whenever progress was invisible — and learners quit when no one noticed they'd stopped.",
        what: "Streaks, XP, unlockable tracks and badges make every small step visible. Smart AI nudges step in when scores drop or a learner goes quiet.",
        figure: { src: `${NOVU_IMG}/game-mechanics.webp`, w: 1400, h: 970, alt: "Game mechanics: streaks, unlock system, badges, XP, leaderboards, quests and progress bars." },
      },
      {
        title: "Learning by doing, with feedback",
        why: "Learners only felt they'd learned when they built something — and they wanted to know it was right.",
        what: "A practice hub of real-world briefs and timed projects, reviewed with clear feedback, so every path ends in portfolio-ready work.",
        figure: { src: `${NOVU_IMG}/mobile-ui.webp`, w: 1400, h: 2126, alt: "NOVU mobile screens: home roadmap, lessons, quizzes, community, achievements and mentor review." },
      },
    ],
    design: {
      intro:
        "From information architecture and wireframes to a high-fidelity design system across mobile, web and the admin dashboard.",
      figures: [
        { src: `${NOVU_IMG}/information-architecture.webp`, w: 1400, h: 2050, alt: "NOVU information architecture: onboarding, home, explore, practice hub, community and profile.", caption: "Information architecture" },
        { src: `${NOVU_IMG}/web-ui.webp`, w: 1400, h: 1601, alt: "NOVU web app screens.", caption: "Web app" },
        { src: `${NOVU_IMG}/dashboard.webp`, w: 1400, h: 1603, alt: "NOVU admin dashboard for paths, learners, rewards and AI mentor.", caption: "Admin dashboard" },
        { src: `${NOVU_IMG}/branding.webp`, w: 1400, h: 648, alt: "NOVU logo and app icon.", caption: "Brand identity" },
      ],
    },
    next: [
      { title: "Live challenges", body: "Real-time challenges where learners solve tasks together." },
      { title: "Mentor ranking", body: "Advanced learners become mentors, ranked by community feedback." },
      { title: "Skill translator", body: "Help career shifters carry existing skills into a new tech field." },
      { title: "Richer rewards", body: "Real incentives such as mentor sessions and learning benefits." },
    ],
  },
];

export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
