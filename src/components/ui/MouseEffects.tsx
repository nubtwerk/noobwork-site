"use client";

import { useRef } from "react";
import { useSpotlight } from "@/hooks/useSpotlight";
import { useParallaxAndShimmer } from "@/hooks/useParallaxAndShimmer";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useTilt } from "@/hooks/useTilt";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function MouseEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const enabled = !reducedMotion && !coarsePointer;

  useSpotlight(spotlightRef, enabled);
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
