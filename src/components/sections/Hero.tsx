"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Award, Star, UserRound } from "lucide-react";

export default function Hero() {
  return (
    <>
      <section className="site-section site-section--dark">
        <div className="shell-inner">
          <motion.div
            className="hero-lockup"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h1 aria-label="Noobwork">
              <span className="site-logo site-logo--wordmark">NOOBWORK.</span>
            </h1>
            <p className="hero-lockup__subtitle">
              Lifestyle / Personal Development / Gaming Heritage
            </p>
          </motion.div>
        </div>
      </section>

      <section className="site-section site-section--tight">
        <div className="shell-inner">
          <div className="hero-panel">
            <motion.div
              className="hero-panel__content"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            >
              <h2 className="hero-panel__eyebrow">NOOBWORK.</h2>
              <p className="hero-panel__copy">
                Eight years after stepping away from content to build companies, Joachim Haraldsen is back in Tokyo, documenting what comes next.
              </p>
              <div className="hero-actions">
                <Link href="/#work" className="btn btn--primary">
                  See What I&apos;m Building
                </Link>
                <Link href="/#connect" className="btn btn--secondary">
                  Work Together
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="hero-panel__media"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Image
                src="/joachim.jpg"
                alt="Joachim Haraldsen holding a coffee in Tokyo"
                width={500}
                height={600}
                sizes="(max-width: 768px) 100vw, 28rem"
                className="hero-panel__image"
                priority
              />
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
            >
              <div className="hero-stat">
                <Star className="hero-stat__icon" size={18} aria-hidden="true" />
                <div className="hero-stat__value">Forbes</div>
                <div className="hero-stat__label">Featured</div>
              </div>
              <div className="hero-stat">
                <UserRound className="hero-stat__icon" size={18} aria-hidden="true" />
                <div className="hero-stat__value">200K</div>
                <div className="hero-stat__label">Subscribers</div>
              </div>
              <div className="hero-stat">
                <Award className="hero-stat__icon" size={18} aria-hidden="true" />
                <div className="hero-stat__value">12+</div>
                <div className="hero-stat__label">Years creating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
