import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import RevealText from "@/components/ui/RevealText";
import { mediaKitStats } from "@/data/stats";
import { MEDIA_KIT_HREF } from "@/lib/constants";

export default function PartnerCta() {
  return (
    <section id="partner" className="site-section partner">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head">
            <p className="chapter-head__marker">For Brands</p>
            <h2
              className="chapter-head__display partner__display"
              aria-label="Make something with me."
            >
              <RevealText text="Make something" />
              <br />
              <span className="chapter-head__display-accent">
                <RevealText text="with me." delay={0.18} />
              </span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="partner-grid">
          <AnimatedSection delay={0.12} className="partner-pitch">
            <p className="partner-pitch__copy">
              A sponsored video, a recurring series, or content for your own channels.
              I work with brands that belong in my content, from training and
              everyday tech to travel and life in Korea. Explore the formats
              and recent work, then send me your idea.
            </p>
            <div className="hero-actions">
              <Link href={MEDIA_KIT_HREF} data-partnership-source="homepage-partner" className="btn btn--primary" data-magnetic>
                Explore partnerships
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <dl className="partner-stats">
              {mediaKitStats.map((stat) => (
                <div key={stat.label} className="partner-stat">
                  <dt className="partner-stat__label">{stat.label}</dt>
                  <dd className="partner-stat__value">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
