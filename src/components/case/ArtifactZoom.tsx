"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Figure } from "@/lib/case-studies";

/**
 * A research artifact shown as a cropped thumbnail; tap it to open the whole sheet
 * (affinity map, wireframes…) in a dialog you can scroll through, then close.
 */
export default function ArtifactZoom({ figure, label }: { figure: Figure; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="group/zoom relative block aspect-[4/3] w-full overflow-hidden bg-white text-left"
        aria-label={`Open ${label}`}
      >
        <Image
          src={figure.src}
          alt={figure.alt}
          fill
          sizes="(min-width: 1024px) 220px, 80vw"
          className="object-cover object-top transition-transform duration-700 ease-out-expo group-hover/zoom:scale-[1.05]"
        />
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#895CDD] px-2.5 py-1 font-mono text-[10px] uppercase text-[#fff] shadow-[0_4px_12px_-4px_rgba(137,92,221,0.7)] transition-[background-color,transform] group-hover/zoom:scale-105 group-hover/zoom:bg-[#7446c9]">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3M7 5v4M5 7h4" />
          </svg>
          View
        </span>
      </button>

      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto max-h-[90svh] w-[min(56rem,92vw)] overflow-hidden rounded-2xl border border-white/10 bg-paper p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="font-mono text-[11px] uppercase text-ink-soft">{label}</p>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors hover:border-blue-glow/60 hover:text-blue-glow"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="m4 4 8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <div className="max-h-[calc(90svh-4rem)] overflow-y-auto bg-white">
          <Image src={figure.src} alt={figure.alt} width={figure.w} height={figure.h} sizes="(min-width: 960px) 896px, 92vw" className="h-auto w-full" />
        </div>
      </dialog>
    </>
  );
}
