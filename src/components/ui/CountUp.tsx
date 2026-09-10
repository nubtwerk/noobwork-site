"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface CountUpProps {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUp({ target, suffix = "", duration = 0.6, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const formatted = target.toLocaleString("en-US");
  const [display, setDisplay] = useState(formatted);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (!isInView || reducedMotion) return;

    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        setDisplay(Math.round(value).toLocaleString("en-US"));
      },
    });

    return () => controls.stop();
  }, [isInView, target, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{formatted}{suffix}</span>
      <span aria-hidden="true">{reducedMotion ? formatted : display}{suffix}</span>
    </span>
  );
}
