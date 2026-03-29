import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CountUp from "@/components/ui/CountUp";
import { mediaKitStats } from "@/data/stats";
import { audienceDemographics, contentCategories, partnershipTypes } from "@/data/media-kit";

export const metadata: Metadata = {
  title: "Media Kit - Noobwork | Joachim Haraldsen",
  description: "Partner with Noobwork. Audience stats, demographics, content verticals, and collaboration opportunities with Joachim Haraldsen.",
};

export default function MediaKit() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section site-section--dark media-hero-section">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="media-hero">
                <h1 className="media-title media-title--split">
                  <span>Media</span>
                  <span>Kit</span>
                </h1>
                <p className="media-copy">
                  I&apos;ve spent over a decade building authentic communities in gaming, esports, and entertainment. Here&apos;s what a partnership with me looks like.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="site-section site-section--surface">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="section-heading section-heading--center">
                <h2 className="section-heading__title">
                  Audience <span className="section-heading__title--primary">Overview</span>
                </h2>
              </div>
            </AnimatedSection>
            <div className="stat-grid">
              {mediaKitStats.map((stat, i) => (
                <AnimatedSection key={stat.label} delay={i * 0.1}>
                  <div className="stat-card">
                    <div className="stat-card__value">
                      {stat.numericValue != null ? (
                        <CountUp target={stat.numericValue} suffix={stat.suffix} />
                      ) : (
                        <span>{stat.value}</span>
                      )}
                    </div>
                    <p className="stat-card__label">{stat.label}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="section-heading section-heading--center">
                <h2 className="section-heading__title">
                  Audience <span className="section-heading__title--primary">Demographics</span>
                </h2>
              </div>
            </AnimatedSection>
            <div className="info-grid info-grid--three">
              {audienceDemographics.map((item, i) => (
                <AnimatedSection key={item.label} delay={i * 0.1}>
                  <div className="info-card">
                    <p className="info-card__label">{item.label}</p>
                    <p className="info-card__value">{item.value}</p>
                    <p className="info-card__copy">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section site-section--surface">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="section-heading section-heading--center">
                <h2 className="section-heading__title">
                  Content <span className="section-heading__title--primary">Categories</span>
                </h2>
              </div>
            </AnimatedSection>
            <div className="info-grid info-grid--two">
              {contentCategories.map((cat, i) => (
                <AnimatedSection key={cat.title} delay={i * 0.1}>
                  <div className="info-card">
                    <h3 className="info-card__title">{cat.title}</h3>
                    <p className="info-card__copy">{cat.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="section-heading section-heading--center">
                <h2 className="section-heading__title">
                  Partnership <span className="section-heading__title--primary">Types</span>
                </h2>
              </div>
            </AnimatedSection>
            <div className="info-grid info-grid--two">
              {partnershipTypes.map((type, i) => (
                <AnimatedSection key={type.title} delay={i * 0.1}>
                  <div className="info-card">
                    <h3 className="info-card__title">{type.title}</h3>
                    <p className="info-card__copy">{type.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section site-section--surface">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="newsletter-band">
                <h2 className="newsletter-title">
                  Let&apos;s Work <span className="section-heading__title--primary">Together</span>
                </h2>
                <p className="newsletter-copy">
                  Interested in a partnership? Reach out directly or follow my Beacons page for updates and announcements.
                </p>
                <div className="cta-actions">
                  <a
                    href="https://beacons.ai/noobwork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    Follow on Beacons
                  </a>
                  <a
                    href="mailto:joachim@noobwork.no"
                    className="btn btn--secondary"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="site-section site-section--tight">
          <div className="shell-inner section-heading--center">
            <Link href="/" className="back-link">
              &larr; Back to home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
