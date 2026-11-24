/**
 * The work, in two tiers:
 *   FEATURED  — the strongest work; it gets the orbit (layer 04, "The Core").
 *   MORE_WORK — earlier projects, listed under it ("More work"), with Behance for the rest.
 * Add, remove or reorder freely. Covers come from each project's Behance cover
 * (public/images/projects); `hue` tints the generated fallback cover if an
 * image is ever missing.
 */
export type Project = {
  name: string;
  what: string; // one line: what it is
  meta: string; // platform / type
  hue: number; // fallback cover tint (0–360)
  href: string; // the Behance case study
  caseStudy?: string; // the case study inside the portfolio, when there is one (preferred over Behance)
  image?: string;
};

const BE = "https://www.behance.net/gallery";

export const FEATURED: Project[] = [
  {
    name: "NOVU",
    what: "AI-powered tech career roadmap",
    meta: "ITI graduation project",
    hue: 258,
    href: `${BE}/254132483/NOVU-AI-Powered-Tech-Career-Roadmap-Platform`,
    caseStudy: "/work/novu",
    image: "/images/projects/novu.webp",
  },
  {
    name: "Sana'a",
    what: "Handcraft workshop booking",
    meta: "Mobile · UX case study",
    hue: 28,
    href: `${BE}/245083381/Sanaa-Handcrafts-Booking-UXUI-Case-Study`,
    caseStudy: "/work/sanaa",
    image: "/images/projects/sanaa.webp",
  },
  {
    name: "Khota",
    what: "Prayer & daily remembrance",
    meta: "Mobile · Arabic-first",
    hue: 32,
    href: `${BE}/246106691/_`,
    image: "/images/projects/khota.webp",
  },
  {
    name: "Saknny",
    what: "Student housing & home services",
    meta: "Mobile app",
    hue: 190,
    href: `${BE}/246243185/Saknny-Student-Housing-Home-Services-App`,
    caseStudy: "/work/saknny",
    image: "/images/projects/saknny.webp",
  },
  {
    name: "Rooted",
    what: "Plants & green solutions",
    meta: "Website · E-commerce",
    hue: 120,
    href: `${BE}/249226671/Rooted-Plants-Green-Solutions-Website-UIUX-Design`,
    image: "/images/projects/rooted.webp",
  },
];

export const MORE_WORK: Project[] = [
  {
    name: "Hawy",
    what: "AI football analytics platform",
    meta: "Dashboard · Data viz",
    hue: 96,
    href: `${BE}/248320787/Hawy-AI-Powered-Football-Analytics-Platform`,
    image: "/images/projects/hawy.webp",
  },
  {
    name: "Unwind",
    what: "Mental wellness landing page",
    meta: "Website · Landing page",
    hue: 225,
    href: `${BE}/249152477/Unwind-Mental-Wellness-Landing-Page`,
    image: "/images/projects/unwind.webp",
  },
  {
    name: "Magic AI",
    what: "AI recipe generator",
    meta: "Web app · AI",
    hue: 24,
    href: `${BE}/249151875/Magic-AI-Cooking-Assistant-UIUX-Design`,
    image: "/images/projects/magic.webp",
  },
  {
    name: "Campus Pulse",
    what: "University events platform",
    meta: "Website · Events",
    hue: 205,
    href: `${BE}/239546735/Campus-Pulse-Events-Website`,
    image: "/images/projects/campus.webp",
  },
];
