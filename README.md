# Tasneem El-Dweik — Portfolio

UI/UX & Product Designer. *Designing for the why behind every click.*

The portfolio is one dive beneath the surface: each scroll goes a layer deeper —
**01 Surface → 02 The Why → 03 Process → 04 Selected work → 05 More work → 06 What I do → 07 Contact.**

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, Cache Components) · React 19 · TypeScript
- Tailwind CSS v4 (theme tokens in `src/app/globals.css`, dark by default + a light theme)
- [Motion](https://motion.dev) for the scroll choreography
- Web Audio for the optional UI sounds (synthesised — no audio files)

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Where things live

| What | Where |
| --- | --- |
| Contact details, CV link | `src/lib/contact.ts` |
| Projects (featured + more work) | `src/lib/projects.ts` |
| Layers and scroll positions | `src/lib/depth.ts` |
| The hero (layers 01–04) | `src/components/Hero.tsx` |
| Share image / tab icon / 404 | `src/app/opengraph-image.tsx`, `src/app/icon.svg`, `src/app/not-found.tsx` |
| Live address (for link previews) | `SITE` in `src/app/layout.tsx` |

## The CV

The PDF in `public/` is built from `cv/cv.html` with a local Edge/Chrome:

```bash
npm run cv
```

## Accessibility

Respects *reduced motion* (no intro, no animation), keyboard focus is always visible, every
layer is available to screen readers, and sound is off until the visitor turns it on.

---

Designed & built by Tasneem El-Dweik.
