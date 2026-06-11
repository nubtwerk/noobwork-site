"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Thin scroll progress bar pinned under the nav. */
export default function ScrollProgress() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  if (reducedMotion) return null;

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
