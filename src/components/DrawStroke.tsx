"use client";

import { useLayoutEffect, useRef, useState, type SVGProps } from "react";
import { motion } from "motion/react";

type Common = {
  /** when false the stroke stays undrawn; flips to true to draw it */
  play?: boolean;
  delay?: number;
  duration?: number;
  instant?: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Draws an SVG stroke from start to end using its real measured length.
 * (Motion's normalized `pathLength` renders as dots in some Chromium builds.)
 */
function useDraw<T extends SVGGeometryElement>({ play = true, delay = 0, duration = 1.4, instant }: Common) {
  const ref = useRef<T>(null);
  const [len, setLen] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, []);
  const motionProps =
    len === null
      ? { style: { opacity: 0 } }
      : {
          strokeDasharray: `${len} ${len}`,
          initial: { strokeDashoffset: len, opacity: 0 },
          animate: play ? { strokeDashoffset: 0, opacity: 1 } : { strokeDashoffset: len, opacity: 0 },
          transition: { duration: instant ? 0.25 : duration, delay: instant ? 0 : delay, ease },
        };
  return { ref, motionProps };
}

export function DrawPath({ play, delay, duration, instant, ...rest }: Common & SVGProps<SVGPathElement>) {
  const { ref, motionProps } = useDraw<SVGPathElement>({ play, delay, duration, instant });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <motion.path ref={ref} {...(rest as any)} {...motionProps} />;
}

export function DrawEllipse({ play, delay, duration, instant, ...rest }: Common & SVGProps<SVGEllipseElement>) {
  const { ref, motionProps } = useDraw<SVGEllipseElement>({ play, delay, duration, instant });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <motion.ellipse ref={ref} {...(rest as any)} {...motionProps} />;
}
