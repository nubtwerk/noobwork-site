"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import { useMarqueePause } from "@/hooks/useMarqueePause";

const brands = ["Forbes", "YouTube", "Heroic", "Blast.tv", "Team Haraldsen", "DailyBase"];

export default function SocialProof() {
  const trackRef = useMarqueePause<HTMLDivElement>();

  const row = brands.map((brand) => (
    <span key={brand} className="social-marquee__item">
      {brand}
      <span className="social-marquee__dot" aria-hidden="true" />
    </span>
  ));

  return (
    <section className="site-section site-section--tight">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="social-proof">
            <p className="social-proof__eyebrow">Featured In &amp; Associated With</p>
          </div>
        </AnimatedSection>
      </div>
      <AnimatedSection delay={0.1}>
        <div className="social-marquee" role="img" aria-label={brands.join(", ")}>
          <div ref={trackRef} className="social-marquee__track">
            <span className="social-marquee__group">{row}</span>
            <span className="social-marquee__group" aria-hidden="true">{row}</span>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
