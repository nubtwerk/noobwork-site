import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CountUp from "@/components/ui/CountUp";
import { mediaKitStats } from "@/data/stats";
import { contentCategories, partnershipTypes, partnershipProcess } from "@/data/media-kit";
import { BEACONS_URL } from "@/data/external-links";

export const metadata: Metadata = {
  title: "Media Kit",
  description: "Partner with Noobwork. Audience stats, demographics, content verticals, and collaboration opportunities with Joachim Haraldsen.",
  openGraph: {
    title: "Media Kit — Noobwork",
    description: "Partner with Noobwork. Audience stats, demographics, and collaboration opportunities.",
  },
};

export default function MediaKit() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main media-kit">
        {/* Hero */}
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

        {/* Stat Band */}
        <AnimatedSection>
          <div className="mk-stat-band">
            {mediaKitStats.map((stat, i) => (
              <div key={stat.label} className="mk-stat" data-magnetic>
                <div className="mk-stat__value">
                  {stat.numericValue != null ? (
                    <CountUp target={stat.numericValue} suffix={stat.suffix} />
                  ) : (
                    <span>{stat.value}</span>
                  )}
                </div>
                <p className="mk-stat__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Audience — Visual */}
        <div className="mk-content">
          <section className="mk-editorial">
            <AnimatedSection>
              <h2 className="mk-editorial__heading" data-shimmer>Audience</h2>
            </AnimatedSection>
            <div className="mk-audience-grid">
              <AnimatedSection delay={0.1}>
                <div className="mk-audience-card" data-tilt>
                  <div className="mk-audience-card__label">Core Age Range</div>
                  <div className="mk-age-range">
                    <div className="mk-age-range__seg" style={{ flex: 1 }}>13–17</div>
                    <div className="mk-age-range__seg mk-age-range__seg--active" style={{ flex: 2.5 }}>18–34</div>
                    <div className="mk-age-range__seg" style={{ flex: 1 }}>35–44</div>
                    <div className="mk-age-range__seg" style={{ flex: 0.5 }}>45+</div>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="mk-audience-card" data-tilt>
                  <div className="mk-audience-card__label">Gender Split</div>
                  <div className="mk-bar-chart">
                    <div className="mk-bar-row">
                      <span className="mk-bar-row__label">Male</span>
                      <div className="mk-bar-row__track"><div className="mk-bar-row__fill mk-bar-row__fill--primary" style={{ width: "75%" }} /></div>
                      <span className="mk-bar-row__pct">75%</span>
                    </div>
                    <div className="mk-bar-row">
                      <span className="mk-bar-row__label">Female</span>
                      <div className="mk-bar-row__track"><div className="mk-bar-row__fill mk-bar-row__fill--sand" style={{ width: "25%" }} /></div>
                      <span className="mk-bar-row__pct">25%</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <div className="mk-audience-card" data-tilt>
                  <div className="mk-audience-card__label">Top Regions</div>
                  <div className="mk-region-list">
                    {["Norway", "Sweden", "Denmark"].map(r => (
                      <span key={r} className="mk-region-tag mk-region-tag--primary"><span className="mk-region-tag__dot" />{r}</span>
                    ))}
                    {["Germany", "UK"].map(r => (
                      <span key={r} className="mk-region-tag"><span className="mk-region-tag__dot" />{r}</span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Content Categories — Numbered */}
          <section className="mk-editorial">
            <AnimatedSection>
              <h2 className="mk-editorial__heading" data-shimmer>Content</h2>
            </AnimatedSection>
            <ul className="mk-numbered-list">
              {contentCategories.map((cat, i) => (
                <AnimatedSection key={cat.title} delay={i * 0.08}>
                  <li className="mk-numbered-item">
                    <span className="mk-numbered-item__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mk-numbered-item__title">{cat.title}</span>
                    <p className="mk-numbered-item__desc">{cat.description}</p>
                  </li>
                </AnimatedSection>
              ))}
            </ul>
          </section>

          {/* Partnership Types — Numbered */}
          <section className="mk-editorial">
            <AnimatedSection>
              <h2 className="mk-editorial__heading" data-shimmer>Partnerships</h2>
            </AnimatedSection>
            <ul className="mk-numbered-list">
              {partnershipTypes.map((type, i) => (
                <AnimatedSection key={type.title} delay={i * 0.08}>
                  <li className="mk-numbered-item">
                    <span className="mk-numbered-item__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mk-numbered-item__title">{type.title}</span>
                    <p className="mk-numbered-item__desc">{type.description}</p>
                  </li>
                </AnimatedSection>
              ))}
            </ul>
          </section>

          {/* Process — Steps */}
          <section className="mk-editorial">
            <AnimatedSection>
              <h2 className="mk-editorial__heading" data-shimmer>Process</h2>
            </AnimatedSection>
            <div className="mk-process-grid">
              {partnershipProcess.map((step, i) => (
                <AnimatedSection key={step.title} delay={i * 0.08}>
                  <div className="mk-process-step">
                    <div className="mk-process-step__num">{step.step}</div>
                    <div className="mk-process-step__title">{step.title}</div>
                    <p className="mk-process-step__desc">{step.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* CTA */}
          <AnimatedSection>
            <div className="mk-cta">
              <h2 className="newsletter-title">
                Let&apos;s Work <span className="section-heading__title--primary">Together</span>
              </h2>
              <p className="newsletter-copy">
                Interested in a partnership? Reach out directly or follow my Beacons page for updates and announcements.
              </p>
              <div className="cta-actions">
                <a href={BEACONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  Follow on Beacons
                </a>
                <a href="mailto:joachim@noobwork.no" className="btn btn--secondary">
                  Get in Touch
                </a>
              </div>
            </div>
          </AnimatedSection>

          <div className="section-heading--center">
            <Link href="/" className="back-link">&larr; Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
