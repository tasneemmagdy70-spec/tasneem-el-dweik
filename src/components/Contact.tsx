"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { BEHANCE_URL, EMAIL, EMAIL_URL, LINKEDIN_URL, WHATSAPP_DISPLAY, WHATSAPP_URL, ext } from "@/lib/contact";
import CopyButton from "./CopyButton";
import ContactAtom from "./ContactAtom";
import DeepAmbient, { DepthTag } from "./DeepAmbient";
import { ArrowUpRight, LinkedInIcon, MailIcon, WhatsAppIcon } from "./icons";

/**
 * CONTACT — the end of the dive. Every way in gets the same weight: a recruiter
 * may prefer email or LinkedIn, a client WhatsApp — so three equal channels.
 * (The CV lives in the hero and the menu.) The nucleus behind
 * the headline wakes up whenever one of them is about to be used.
 */

const ease = [0.16, 1, 0.3, 1] as const;
const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, delay: i * 0.08, ease } }),
};
const reveal = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-8% 0px" }, variants: item } as const;

// one set, one colour: the real marks, solid, so the three ways in read as equals
const icon = {
  mail: <MailIcon className="size-[19px] sm:size-[21px]" />,
  chat: <WhatsAppIcon className="size-[18px] sm:size-[20px]" />,
  linkedin: <LinkedInIcon className="size-[16px] sm:size-[18px]" />,
};

type Channel = { key: string; label: string; value: string; line: string; href: string; icon: ReactNode; action: string; download?: boolean };

const CHANNELS: Channel[] = [
  {
    key: "email",
    label: "Email",
    value: EMAIL,
    line: "For roles, projects and everything in between.",
    href: EMAIL_URL,
    icon: icon.mail,
    action: "Write to me",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    line: "Quick questions — the fastest way to reach me.",
    href: WHATSAPP_URL,
    icon: icon.chat,
    action: "Start a chat",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    value: "in/tasneem-el-dweik",
    line: "Follow my journey — new projects and milestones as they happen.",
    href: LINKEDIN_URL,
    icon: icon.linkedin,
    action: "Follow along",
  },
];

export default function Contact() {
  const reduce = useReducedMotion();
  const [charged, setCharged] = useState(false);
  const charge = {
    onPointerEnter: () => setCharged(true),
    onPointerLeave: () => setCharged(false),
    onFocus: () => setCharged(true),
    onBlur: () => setCharged(false),
  };

  return (
    <section id="contact" className="relative overflow-clip border-t border-white/[0.06] bg-paper px-6 pt-16 sm:px-10 sm:pt-20 lg:px-8 lg:pt-24">
      {/* the bottom of the dive: warmer light */}
      <DeepAmbient seed={13} particles={14} lights={[{ color: "var(--color-blue-bright)", x: "72%", y: "38%", size: "44rem", opacity: 0.16 }]} />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(var(--rgb-bright)/0.18),transparent_65%)] blur-2xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div {...reveal} custom={0} className="mb-2">
          <DepthTag n="07" name="Contact" depth="-540m" />
        </motion.div>

        <div className="mt-2 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-stretch lg:gap-16">
          {/* left: the ask, then every way in — a calm list, all the same weight */}
          <div className="min-w-0">
            {/* phone/tablet: the nucleus glows behind the headline instead of taking a box of its own */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 1.4, ease }}
                className="pointer-events-none absolute -right-24 -top-16 w-[21rem] opacity-55 sm:-right-10 sm:w-[26rem] lg:hidden"
              >
                <ContactAtom charged={charged} className="w-full" />
              </motion.div>
              <div className="relative">
                <motion.h2 {...reveal} custom={1} className="font-serif text-[clamp(2.6rem,6.5vw,4.6rem)] leading-[0.98] tracking-[-0.025em] text-ink">
                  Let&apos;s design
                  <br />
                  the <span className="italic text-blue-glow">why</span> together.
                </motion.h2>
                <motion.span {...reveal} custom={2} aria-hidden className="mt-7 block h-px w-16 bg-white/25" />
                <motion.p {...reveal} custom={2} className="mt-7 max-w-[32rem] text-[0.98rem] leading-relaxed text-ink-soft sm:text-[1.06rem] lg:text-[1rem]">
                  Open to full-time roles, part-time work and freelance projects. Have a product, a role or an idea? Pick whichever way suits you — they all
                  reach me.
                </motion.p>
              </div>
            </div>

            <ul className="mt-9 border-t border-white/[0.08]">
              {CHANNELS.map((c, i) => (
                <motion.li key={c.key} {...reveal} custom={i + 3} className="border-b border-white/[0.08]" {...charge}>
                  <div className="group relative flex items-center gap-3 py-4 sm:gap-5 sm:py-5">
                    {/* the whole row is the link; the copy button sits above it */}
                    <a
                      href={c.href}
                      {...ext(c.href)}
                      {...(c.download ? { download: "" } : {})}
                      aria-label={`${c.label}: ${c.value} — ${c.action}`}
                      className="absolute inset-0 z-0"
                    />
                    <span className="pointer-events-none grid size-11 shrink-0 place-items-center rounded-full border border-blue-glow/20 bg-blue-bright/10 text-blue-glow transition-all duration-500 ease-out-expo group-hover:scale-105 group-hover:border-transparent group-hover:bg-cta group-hover:text-on-cta sm:size-14">
                      {c.icon}
                    </span>
                    <span className="pointer-events-none min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft">{c.label}</span>
                      <span className="mt-1 block break-all text-[0.95rem] text-ink transition-colors duration-300 group-hover:text-blue-glow sm:text-[1.08rem]">
                        {c.value}
                      </span>
                    </span>
                    {c.key === "email" && (
                      <span className="relative z-10 hidden sm:block">
                        <CopyButton text={EMAIL} className="!px-3 !py-1.5" />
                      </span>
                    )}
                    <span className="pointer-events-none grid size-8 shrink-0 place-items-center rounded-full text-ink-soft transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:text-blue-glow">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* desktop: the nucleus on its own side — the dive ends where it began */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.4, ease }}
            className="pointer-events-none relative hidden items-center justify-center lg:flex"
          >
            <ContactAtom charged={charged} className="w-[115%] max-w-[40rem]" />
          </motion.div>
        </div>
        {/* footer */}
        <footer className="mt-16 border-t border-white/[0.08] pb-8 pt-10 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <p className="font-script text-[2.3rem] leading-none text-ink">El-Dweik</p>
              <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-soft">UI/UX &amp; Product Designer</p>
            </div>

            <nav
              aria-label="Elsewhere"
              className="flex flex-wrap items-center justify-center gap-x-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft"
            >
              {[
                { label: "LinkedIn", href: LINKEDIN_URL },
                { label: "Behance", href: BEHANCE_URL },
                { label: "WhatsApp", href: WHATSAPP_URL },
                { label: "Email", href: EMAIL_URL },
              ].map((l) => (
                <a key={l.label} href={l.href} {...ext(l.href)} className="inline-flex min-h-11 items-center px-1.5 transition-colors hover:text-ink">
                  {l.label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-glow/30 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-glow transition-colors hover:border-blue-glow hover:text-ink"
            >
              Back to the surface
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-1.5 border-t border-white/[0.05] pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft sm:flex-row sm:justify-between">
            <span>© 2026 Tasneem El-Dweik</span>
            <span>Designed &amp; built by Tasneem</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
