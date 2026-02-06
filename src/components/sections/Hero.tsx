"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-primary text-sm font-medium tracking-wide uppercase mb-4">
            Creator &bull; Entrepreneur &bull; Esports Pioneer
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Hey, I&apos;m <span className="text-primary">Joachim</span>
          </h1>
          <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
            Norwegian creator based in Tokyo. Building at the intersection of gaming, technology, and entertainment. Forbes featured entrepreneur.
          </p>
          <div className="flex gap-4 mb-8">
            <a href="#work" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors">
              View My Work
            </a>
            <a href="#connect" className="bg-surface text-foreground px-6 py-3 rounded-lg font-medium border border-border hover:border-primary transition-colors">
              Get in Touch
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <span className="text-primary">★</span>
              <span>Forbes Featured</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">200K+</span> YouTube subscribers
            </div>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
          <Image
            src="/joachim.jpg"
            alt="Joachim Haraldsen"
            width={500}
            height={600}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="relative rounded-3xl shadow-xl object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
