/**
 * The one primary button, everywhere: the shape, size and colour of the first one on the page
 * ("View My Work"). A pill in the action blue with a white disc for the arrow; it grows a
 * step on tablets and on desktop. No outer glow — the colour alone says "this is the action".
 */
export const BTN_PRIMARY =
  "group relative inline-flex w-fit shrink-0 items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full bg-cta py-1.5 pl-4 pr-1.5 text-[0.8rem] font-medium text-on-cta shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-300 hover:bg-cta-hover sm:py-2 sm:pl-5 sm:pr-2 sm:text-[1rem] lg:gap-3 lg:py-3.5 lg:pl-6 lg:pr-3.5 lg:text-[0.95rem]";

/** the white disc that carries the button's arrow */
export const BTN_PRIMARY_ICON =
  "relative grid size-7 shrink-0 place-items-center rounded-full bg-on-cta text-blue transition-transform duration-500 ease-out-expo sm:size-9 lg:size-8";

/** The same primary button at a fixed medium size (48px) — for inside a card, where the hero-sized
 *  pill would outweigh the content it belongs to. Same shape, colour and arrow disc. */
export const BTN_PRIMARY_MD =
  "group relative inline-flex w-fit shrink-0 items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full bg-cta py-2 pl-5 pr-2 text-[0.95rem] font-medium text-on-cta shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-300 hover:bg-cta-hover";

export const BTN_PRIMARY_MD_ICON =
  "relative grid size-8 shrink-0 place-items-center rounded-full bg-on-cta text-blue transition-transform duration-500 ease-out-expo group-hover:rotate-45";
