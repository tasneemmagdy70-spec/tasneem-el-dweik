"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { AVAILABILITY, BEHANCE_URL, CV_URL, EMAIL, EMAIL_URL, LINKEDIN_URL, WHATSAPP_URL, ext } from "@/lib/contact";
import { LAYERS, currentLayer, goToLayer } from "@/lib/depth";
import CopyButton from "./CopyButton";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import { uiSound } from "@/lib/uiSound";
import { ArrowUpRight, WhatsAppIcon } from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

/** Text that rolls up to a copy of itself on hover. */
function Roll({ children }: { children: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
        {children}
      </span>
    </span>
  );
}

export default function Navbar() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [here, setHere] = useState(0);
  const [atContact, setAtContact] = useState(false);
  // the floating "Let's talk" waits for the first scroll: the opening screen ends in
  // "Scroll to read", and nothing should sit on top of that invitation
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const panel = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  // full size on the first screen; within the first ~third of a screen of scrolling it settles small
  const logoScale = useTransform(scrollY, [0, 260], [1, 0.72]);
  const logoDim = useTransform(scrollY, [0, 260], [1, 0.85]);

  // Purpose: once content scrolls under the bar, give it a surface so links stay legible.
  // (The pinned hero manages its own top area, so the fade only starts once you've left it.)
  useMotionValueEvent(scrollY, "change", (y) => {
    const hero = document.getElementById("top");
    const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight : 24;
    setScrolled(y > heroEnd + 24);
    setMoved(y > 40);
  });

  // Menu open: freeze the page behind it, keep Tab inside, Esc closes.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      const f = [burger.current, ...panel.current.querySelectorAll<HTMLElement>("a,button")].filter(Boolean) as HTMLElement[];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // the menu opens with a soft rush rising, and closes with it falling
  const firstMenu = useRef(true);
  useEffect(() => {
    if (firstMenu.current) {
      firstMenu.current = false;
      return;
    }
    uiSound.menu(open);
  }, [open]);

  /** close the menu, let the page unfreeze, then travel */
  const go = (i: number) => {
    setOpen(false);
    window.setTimeout(() => goToLayer(i), 60);
  };

  const glass = scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-5 pt-4 md:px-8 md:pt-6"
      >
        {/* No bar, no container: the logo and the actions float at the corners.
            Once content scrolls underneath, a soft fade (not a box) keeps them legible. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-paper via-paper/70 to-transparent transition-opacity duration-500 ${glass ? "opacity-100" : "opacity-0"}`}
        />
        <nav className="relative flex w-full max-w-6xl items-center justify-between" aria-label="Main">
          {/* Purpose: the signature introduces me on the first screen, then steps back to a
              quiet mark once reading starts — it should orient, never compete with content. */}
          <motion.a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
            }}
            style={{ scale: logoScale, opacity: logoDim }}
            className="shrink-0 origin-left whitespace-nowrap font-script text-[1.8rem] leading-none text-ink transition-colors hover:text-blue-glow md:text-[2.6rem]"
            aria-label="El-Dweik — back to top"
          >
            El-Dweik
          </motion.a>
          <span className="flex-1" />

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Purpose: the one action that matters — straight to the contact layer. The green dot = available now. */}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                go(6);
              }}
              className="group hidden items-center gap-2 whitespace-nowrap rounded-full border border-white/12 lg:flex bg-white/[0.04] py-2 pl-2.5 pr-3 font-mono text-[10px] uppercase tracking-[0.12em] sm:pl-3 sm:pr-3.5 sm:text-[10.5px] sm:tracking-[0.18em] text-ink transition-colors duration-300 hover:border-available/50 hover:bg-available/10 md:pl-3.5 md:pr-4 md:text-[11px]"
            >
              <span className="relative flex size-1.5">
                {!reduce && <span className="absolute inline-flex size-full animate-ping rounded-full bg-available opacity-60" />}
                <span className="relative inline-flex size-1.5 rounded-full bg-available" />
              </span>
              <Roll>Let&apos;s Talk</Roll>
            </a>

            {/* sound (off by default) · light / dark */}
            <SoundToggle />
            <ThemeToggle />

            {/* burger */}
            <button
              ref={burger}
              type="button"
              onClick={() => {
                if (!open) setHere(currentLayer());
                setOpen(!open);
              }}
              className="group -mr-2.5 grid size-11 place-items-center rounded-full"
              aria-expanded={open}
              aria-controls="site-menu"
              data-sound="own"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span className="relative block h-3 w-6">
                <span
                  className={`absolute right-0 h-[1.5px] rounded-full bg-ink transition-all duration-500 ease-out-expo ${open ? "top-1.5 w-6 rotate-45" : "top-0 w-6"}`}
                />
                <span
                  className={`absolute right-0 h-[1.5px] rounded-full bg-ink transition-all duration-500 ease-out-expo ${
                    open ? "top-1.5 w-6 -rotate-45" : "top-3 w-4 group-hover:w-6"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* full-screen menu: opens out of the burger like a lens widening */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[45]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.1 } }}
            transition={{ duration: reduce ? 0 : 0.35 }}
          >
            {/* the site stays there, dimmed and softened behind — you have not left it */}
            <div aria-hidden onClick={() => setOpen(false)} className="absolute inset-0 bg-[rgb(var(--rgb-halo)/0.6)] backdrop-blur-md" />

            {/* the menu: a layer floating over the page, not a new page */}
            <motion.div
              ref={panel}
              id="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="absolute inset-x-3 bottom-3 top-[4.5rem] mx-auto flex max-w-[1180px] origin-top-right flex-col overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/10 bg-panel-deep/90 px-6 py-6 shadow-[0_30px_80px_-30px_rgb(var(--rgb-shadow)/0.9)] backdrop-blur-2xl sm:inset-x-6 sm:bottom-6 sm:top-[5.5rem] sm:px-10 sm:py-10 lg:inset-x-8 lg:bottom-8 lg:top-[6.25rem] lg:px-14 lg:py-12"
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: reduce ? 0 : 0.5, ease }}
            >
              {/* blueprint grid, same language as the x-ray */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(var(--rgb-glow)/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--rgb-glow)/0.05)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_70%_at_80%_10%,black,transparent)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgb(var(--rgb-bright)/0.35),transparent_65%)] blur-2xl"
              />

              <div className="relative grid w-full flex-1 gap-7 sm:gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
                {/* the layers */}
                <nav aria-label="Sections">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.25 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft sm:mb-4"
                  >
                    ◎ Dive to
                  </motion.p>
                  <ul className="border-b border-white/[0.08]">
                    {LAYERS.map((l, i) => {
                      const on = i === here;
                      return (
                        <li key={l.n} className="overflow-hidden border-t border-white/[0.08]">
                          <motion.a
                            href={"id" in l ? `#${l.id}` : "#top"}
                            onClick={(e) => {
                              e.preventDefault();
                              go(i);
                            }}
                            aria-current={on ? "location" : undefined}
                            className="group flex min-h-11 items-center gap-4 py-2 sm:py-3.5 lg:py-3"
                            initial={{ y: "110%" }}
                            animate={{ y: 0, transition: { duration: 0.8, delay: 0.16 + i * 0.05, ease } }}
                            exit={{ y: "110%", transition: { duration: 0.25 } }}
                          >
                            <span className={`w-6 font-mono text-[10px] tracking-[0.15em] ${on ? "text-sand" : "text-blue-glow"}`}>{l.n}</span>
                            <span
                              className={`font-serif text-[clamp(1.6rem,6.4vw,2.6rem)] leading-none transition-all duration-500 ease-out-expo group-hover:translate-x-2 group-hover:text-blue-glow sm:text-[2.9rem] lg:text-[clamp(2.2rem,4.2svh,3rem)] ${
                                on ? "italic text-blue-glow" : "text-ink"
                              }`}
                            >
                              {l.name}
                            </span>
                            <span className="ml-auto flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-soft">
                              {on && <span className="size-1.5 rounded-full bg-sand shadow-[0_0_10px_rgb(var(--rgb-sand)/0.8)]" />}
                              <span className="hidden sm:inline">{on ? "You are here" : l.note}</span>
                            </span>
                          </motion.a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* quick contact */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.7, ease } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-col gap-4 sm:gap-6 lg:justify-end lg:pb-1"
                >
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
                    <span className="size-1.5 rounded-full bg-available" />
                    {AVAILABILITY}
                  </p>
                  <div>
                    <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-soft">Email</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={EMAIL_URL}
                        className="break-all font-serif text-[1.3rem] leading-tight text-ink underline decoration-white/25 underline-offset-[6px] transition-colors hover:text-blue-glow hover:decoration-blue-glow sm:text-[1.8rem]"
                      >
                        {EMAIL}
                      </a>
                      <CopyButton text={EMAIL} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* the CV leads (filled): it's what a recruiter opens the menu for */}
                    {[
                      { label: "Download CV", href: CV_URL, primary: true },
                      { label: "WhatsApp", href: WHATSAPP_URL, dot: true },
                      { label: "LinkedIn", href: LINKEDIN_URL },
                      { label: "Behance", href: BEHANCE_URL },
                    ].map((c) => (
                      <a
                        key={c.label}
                        href={c.href}
                        {...ext(c.href)}
                        onClick={() => setOpen(false)}
                        className={`group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.85rem] transition-colors ${
                          "primary" in c
                            ? "border-transparent bg-cta font-medium text-on-cta hover:bg-cta-hover"
                            : "border-white/12 text-ink hover:border-blue-glow/60 hover:text-blue-glow"
                        }`}
                      >
                        {"dot" in c && <span className="size-1.5 rounded-full bg-available" />}
                        {c.label}
                        <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* phone & tablet: "Let's talk" floats in the thumb's corner (bottom-left, away from the
          browser's own controls), so the top bar stays calm. It's the one primary-coloured
          thing on screen, so the eye finds it; a slow ring of text says what it is, and a soft
          ripple now and then reminds without nagging. It steps aside while the menu is open
          and once you're already at Contact. */}
      <AnimatePresence>
        {!open && !atContact && moved && (
          <motion.a
            key="talk-float"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Let's talk on WhatsApp (opens WhatsApp)"
            initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.55, ease }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-40 grid size-[4.75rem] place-items-center rounded-full bg-cta text-on-cta shadow-[0_14px_34px_-10px_rgb(var(--rgb-bright)/0.75),inset_0_1px_0_rgba(255,255,255,0.18)] sm:left-6 sm:size-[5.5rem] lg:hidden"
          >
            {/* the ripple: a breath of light, every few seconds */}
            {!reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full border border-blue-glow"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: "easeOut", delay: 0.8 }}
              />
            )}
            {/* the ring of words, turning slowly */}
            <motion.svg
              aria-hidden
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 size-full"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <path id="talk-ring" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
              </defs>
              <text className="fill-current font-mono uppercase" fontSize="9.6" textLength="228" lengthAdjust="spacing" opacity="0.9">
                <textPath href="#talk-ring">Let&apos;s talk · on WhatsApp · </textPath>
              </text>
            </motion.svg>
            {/* the centre: the WhatsApp mark — it says where the tap takes you before you tap */}
            <WhatsAppIcon className="relative size-[1.3rem] sm:size-[1.45rem]" />
          </motion.a>
        )}
      </AnimatePresence>    </>
  );
}
