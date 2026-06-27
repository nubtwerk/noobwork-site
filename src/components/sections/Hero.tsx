"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import TypeMarquee from "@/components/ui/TypeMarquee";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { profileFacts } from "@/data/profile-facts";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const POSTER_LINES = [
  { text: "NOOBWORK.", variant: "solid" as const, drift: -1 },
  { text: "IS BACK.", variant: "outline" as const, drift: 1 },
];

export default function Hero() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll-out choreography: the two poster lines shear apart, the skyline
  // sinks slower than the page, and the whole stage dims.
  const spring = { stiffness: 120, damping: 28, mass: 0.4 };
  const lineShear = useSpring(useTransform(scrollYProgress, [0, 1], [0, 90]), spring);
  const lineShearNeg = useTransform(lineShear, (v) => -v);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  return (
    <section ref={sectionRef} className="poster-hero" aria-label="Intro">
      <motion.div
        className="poster-hero__bg"
        style={reducedMotion ? undefined : { y: bgY }}
        aria-hidden="true"
      >
        <Image
          src="/atmosphere/atmosphere-seoul-dusk.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="poster-hero__bg-image"
        />
      </motion.div>
      <div className="poster-hero__wash" aria-hidden="true" />
      <div className="poster-hero__grain" aria-hidden="true" />

      <motion.div
        className="poster-hero__stage"
        style={reducedMotion ? undefined : { opacity: stageOpacity }}
      >
        <motion.div
          className="poster-hero__topline"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE_OUT_EXPO }}
        >
          <span>Joachim Haraldsen</span>
          <span>Creator / Founder</span>
          <span>Seoul, South Korea</span>
        </motion.div>

        <h1 className="poster-hero__title" aria-label="Noobwork is back">
          {POSTER_LINES.map((line, i) => (
            <span key={line.text} className="poster-hero__line-mask" aria-hidden="true">
              <motion.span
                className={`poster-hero__line poster-hero__line--${line.variant}`}
                initial={reducedMotion ? false : { y: "112%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.12 + i * 0.14, ease: EASE_OUT_EXPO }}
                style={
                  reducedMotion
                    ? undefined
                    : { x: line.drift < 0 ? lineShearNeg : lineShear }
                }
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="poster-hero__deck">
          <motion.p
            className="poster-hero__copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT_EXPO }}
          >
            After years building companies, I&apos;m back to creating. The fitness
            grind, the founder lessons, and the next chapter, documented daily
            from Seoul.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE_OUT_EXPO }}
          >
            <Link href="/media-kit" className="btn btn--sand" data-magnetic>
              Partner With Me
            </Link>
            <Link href="/#reel" className="btn btn--tertiary" data-magnetic>
              Watch the Latest
            </Link>
          </motion.div>
        </div>

        <motion.dl
          className="poster-hero__meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { value: profileFacts.subscribers.short, label: "Subscribers" },
            { value: profileFacts.totalViews.short, label: "Video views" },
            { value: "Forbes", label: "Featured" },
            { value: "13 yrs", label: "Creating" },
          ].map((stat) => (
            <div key={stat.label} className="poster-hero__stat">
              <dt className="poster-hero__stat-label">{stat.label}</dt>
              <dd className="poster-hero__stat-value">{stat.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <div className="poster-hero__band">
        <TypeMarquee
          items={["Fitness", "Personal Development", "Gaming Heritage", "Seoul"]}
          variant="outline"
          duration={42}
        />
      </div>
    </section>
  );
}
