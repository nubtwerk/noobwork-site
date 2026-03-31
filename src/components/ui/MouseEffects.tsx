"use client";

import { useEffect, useRef, useState } from "react";
import { useSpotlight } from "@/hooks/useSpotlight";
import { useParallaxAndShimmer } from "@/hooks/useParallaxAndShimmer";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useTilt } from "@/hooks/useTilt";

export default function MouseEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!reducedMotion && !coarsePointer);
  }, []);

  useSpotlight(enabled ? spotlightRef : { current: null });
  useParallaxAndShimmer(enabled);
  useMagnetic(enabled);
  useTilt(enabled);

  return (
    <div
      ref={spotlightRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0,
        transition: "opacity 600ms ease",
      }}
      aria-hidden="true"
      className="mouse-spotlight"
    />
  );
}
