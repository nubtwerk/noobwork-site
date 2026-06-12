"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const wordVariants: Variants = {
  hidden: { y: "110%", opacity: 0, filter: "blur(6px)" },
  visible: (custom: number) => ({
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: custom, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** Word-by-word kinetic reveal: each word rises out of a mask and unblurs in sequence. */
export default function RevealText({ text, className, delay = 0 }: RevealTextProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const words = text.split(" ");

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    // Visibility is observed on this unclipped wrapper: the masked words are
    // fully clipped at their initial offset, so observing them directly never fires.
    <motion.span
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {words.map((word, i) => (
        // The separating space must live OUTSIDE the inline-block mask:
        // trailing whitespace inside an inline-block is trimmed, which
        // collapses "Creator roots." into "Creatorroots." at poster scale.
        <Fragment key={i}>
          <span className="reveal-word__mask" aria-hidden="true">
            <motion.span className="reveal-word" variants={wordVariants} custom={delay + i * 0.07}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}
