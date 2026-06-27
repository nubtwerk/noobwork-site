"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import RevealText from "@/components/ui/RevealText";
import { YOUTUBE_CHANNEL_URL } from "@/data/external-links";

export default function Newsletter() {
  return (
    <section className="site-section signoff">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="signoff-inner">
            <h2 className="signoff__title" aria-label="Noobwork is back">
              <RevealText text="Noobwork Is Back" />
            </h2>
            <p className="signoff__copy">
              I&apos;m documenting the return properly this time: what I&apos;m
              building, what I&apos;m learning, and what&apos;s changing along
              the way.
            </p>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--sand"
              data-magnetic
            >
              Subscribe on YouTube
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
