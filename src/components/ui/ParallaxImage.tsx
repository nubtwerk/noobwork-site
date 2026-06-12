"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ParallaxImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  /** Total vertical travel in px across the scroll range */
  range?: number;
  caption?: string;
}

/** Editorial image block: drifts against scroll, oversized inside a clipped frame. */
export default function ParallaxImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  range = 60,
  caption,
}: ParallaxImageProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [range, -range]), {
    stiffness: 140,
    damping: 30,
    mass: 0.5,
  });

  return (
    <figure ref={ref} className={`parallax-figure ${className ?? ""}`.trim()}>
      <div className="parallax-figure__frame">
        <motion.div
          className="parallax-figure__inner"
          style={reducedMotion ? undefined : { y }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className="parallax-figure__image"
          />
        </motion.div>
      </div>
      {caption ? (
        <figcaption className="parallax-figure__caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
