"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, UserRound } from "lucide-react";

export default function Hero() {
  return (
    <section>
      <div className="brand-masthead px-6 pt-28 pb-20 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="font-[family-name:var(--font-newake)] text-background text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight">
              NOOBWORK.
            </h1>
            <p className="mt-5 text-background text-xs md:text-base font-semibold tracking-wider uppercase">
              TOKYO LIFESTYLE • PERSONAL DEVELOPMENT • GAMING HERITAGE
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-16 bg-background">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="font-[family-name:var(--font-newake)] text-4xl md:text-5xl text-foreground mb-5 uppercase tracking-tight">
              NOOBWORK.
            </h2>
            <p className="text-lg text-foreground/88 mb-9 leading-relaxed max-w-xl">
              Premium lifestyle creator brand founded by Joachim Haraldsen. Returning after a seven-year hiatus — combining gaming heritage with a new focus on growth, Tokyo lifestyle, and personal development.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/#work" className="bg-primary text-white px-7 py-3 rounded-full font-semibold hover:bg-primary-hover transition-colors">
                View My Work
              </Link>
              <Link href="/#connect" className="bg-offwhite text-foreground px-7 py-3 rounded-full font-semibold border border-sand hover:border-primary transition-colors">
                Get in Touch
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <Image
              src="/joachim.jpg"
              alt="Joachim Haraldsen"
              width={500}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-3xl shadow-[0_20px_40px_rgba(46,29,35,0.22)] object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>

      <div className="bg-surface px-6 pt-8 pb-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 md:gap-4 text-center">
          <div>
            <Star className="w-5 h-5 text-accent mx-auto mb-1 fill-current" />
            <p className="font-bold text-2xl md:text-4xl leading-none">Forbes</p>
            <p className="text-xl md:text-2xl leading-none mt-1">Featured</p>
          </div>
          <div>
            <UserRound className="w-5 h-5 text-accent mx-auto mb-1 fill-current" />
            <p className="font-bold text-3xl md:text-5xl leading-none">200K</p>
            <p className="text-xl md:text-2xl leading-none mt-1">Subscribers</p>
          </div>
          <div>
            <p className="font-bold text-3xl md:text-5xl leading-none mt-5">12+</p>
            <p className="text-xl md:text-2xl leading-none mt-1">Years creating</p>
          </div>
        </div>
      </div>
    </section>
  );
}
