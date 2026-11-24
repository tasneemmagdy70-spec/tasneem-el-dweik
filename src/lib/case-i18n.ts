/**
 * The words of the case-study page itself (not the project's content), in each language a
 * case study can be written in. Arabic case studies also read right-to-left.
 */
export type CaseLang = "en" | "ar";

/** Wrap a number like "30+" so it stays "30+" inside right-to-left text (left-to-right isolate). */
export const ltr = (s: string) => `⁦${s}⁩`;

export const CASE_STRINGS = {
  en: {
    caseStudy: "Case study",
    back: "Back to projects",
    home: "El-Dweik — home",
    chips: "What the project covers",
    problem: "The problem",
    uxProcess: "UX process",
    uxIntro: "Design thinking, end to end. Every screen further down traces back to one of these steps.",
    researchTold: "What research told us",
    keyDecisions: "Key decisions",
    designSystem: "Design system",
    finalScreens: "Final screens",
    color: "Color",
    type: "Type",
    gridIcons: "Grid & icons",
    components: "Components",
    brand: "Brand",
    mobile: "Mobile",
    web: "Web",
    dashboard: "Admin dashboard",
    flow: "Flow",
    view: "View",
    close: "Close",
    open: "Open",
    fullProcess: "The full process is on Behance.",
    openBehance: "Open on Behance",
    moreProjects: "More projects",
    prev: "Previous",
    next: "Next",
    screens: "screens",
    /** "12 of 40+ screens" / "all 8 screens" / "3 screens" */
    count: (shown: number, total: string | undefined, noun: string) =>
      !total ? `${shown} ${noun}` : shown >= Number(total) ? `all ${total} ${noun}` : `${shown} of ${total} ${noun}`,
  },
  ar: {
    caseStudy: "دراسة حالة",
    back: "الرجوع للمشاريع",
    home: "الدويك — الرئيسية",
    chips: "ما يغطيه المشروع",
    problem: "المشكلة",
    uxProcess: "مراحل تجربة المستخدم",
    uxIntro: "تفكير تصميمي من أول خطوة لآخر خطوة، وكل شاشة تحت طالعة من مرحلة من المراحل دي.",
    researchTold: "أهم ما وصلنا له من البحث",
    keyDecisions: "قرارات التصميم الأساسية",
    designSystem: "نظام التصميم",
    finalScreens: "الشاشات النهائية",
    color: "الألوان",
    type: "الخط",
    gridIcons: "الشبكة والأيقونات",
    components: "المكونات",
    brand: "الهوية",
    mobile: "الموبايل",
    web: "الويب",
    dashboard: "لوحة التحكم",
    flow: "مسار",
    view: "عرض",
    close: "إغلاق",
    open: "افتح",
    fullProcess: "الرحلة الكاملة للمشروع على Behance.",
    openBehance: "افتحها على Behance",
    moreProjects: "مشاريع أخرى",
    prev: "السابق",
    next: "التالي",
    screens: "شاشة",
    count: (shown: number, total: string | undefined, noun: string) =>
      !total ? `${shown} ${noun}` : shown >= Number(total) ? `كل الـ${ltr(total)} ${noun}` : `${shown} من ${ltr(total)} ${noun}`,
  },
} as const;
