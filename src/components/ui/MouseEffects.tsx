"use client";

import { useMagnetic } from "@/hooks/useMagnetic";
import { useTilt } from "@/hooks/useTilt";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function MouseEffects() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const enabled = !reducedMotion && !coarsePointer;
  useMagnetic(enabled);
  useTilt(enabled);
  return null;
}
