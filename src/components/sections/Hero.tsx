"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Award, Star, UserRound } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mediaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useSpring(
    useTransform(scrollYProgress, [0, 1], [40, -40]),
    { stiffness: 140, damping: 30, mass: 0.5 }
  );

  return (
    <>
      <section className="site-section site-section--dark">
        <div className="shell-inner">
          <motion.div
            className="hero-lockup"
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          >
            <h1 aria-label="Noobwork">
              <Logo variant="wordmark" className="hero-lockup__logo" />
            </h1>
            <motion.p
              className="hero-lockup__subtitle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT_EXPO }}
            >
              Fitness / Personal Development / Gaming Heritage
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="site-section site-section--tight">
        <div className="shell-inner">
          <div className="hero-panel">
            <motion.div
              className="hero-panel__content"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
            >
              <div className="hero-panel__eyebrow" aria-hidden="true">
                <Logo variant="wordmark" className="hero-panel__eyebrow-logo" />
              </div>
              <p className="hero-panel__copy">
                After years away building companies, Joachim Haraldsen is back to creating, documenting the fitness grind and the next chapter from Seoul.
              </p>
              <div className="hero-actions">
                <Link href="/#work" className="btn btn--primary" data-magnetic>
                  See What I&apos;m Building
                </Link>
                <Link href="/#connect" className="btn btn--secondary" data-magnetic>
                  Work Together
                </Link>
              </div>
            </motion.div>

            <motion.div
              ref={mediaRef}
              className="hero-panel__media"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT_EXPO }}
            >
              <motion.div
                className="hero-panel__media-inner"
                style={reducedMotion ? undefined : { y: parallaxY }}
              >
                <Image
                  src="/joachim.jpg"
                  alt="Joachim Haraldsen holding a coffee"
                  width={500}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 28rem"
                  className="hero-panel__image"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAUDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAiEAABAwMDBQAAAAAAAAAAAAABAgMEAAUHEhNBBhEWISL/xAAVAQEBAAAAAAAAAAAAAAAAAAABA//EABsRAAIBBQAAAAAAAAAAAAAAAAABAwIRITGR/9oADAMBAAIRAxEAPwCVb/Vlyis25l+bImWtTkeSnUpwtncUACffCaVaMIpHleQFdhqVcEknk/b1Km4475pXB2f/2Q=="
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT_EXPO }}
            >
              {[
                { icon: Star, value: "Forbes", label: "Featured" },
                { icon: UserRound, value: "195K+", label: "Subscribers" },
                { icon: Award, value: "13+", label: "Years creating" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="hero-stat"
                    data-magnetic
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.55 + i * 0.1, ease: EASE_OUT_EXPO }}
                  >
                    <Icon className="hero-stat__icon" size={18} aria-hidden="true" />
                    <div className="hero-stat__value">{stat.value}</div>
                    <div className="hero-stat__label">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
