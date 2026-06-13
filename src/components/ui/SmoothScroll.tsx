"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Site-wide momentum scrolling. Disabled for reduced-motion users. */
export default function SmoothScroll() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });

    let rafId: number | null = null;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    function start() { if (rafId === null) rafId = requestAnimationFrame(raf); }
    function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }
    function onVisibility() { if (document.hidden) { stop(); } else { start(); } }

    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
