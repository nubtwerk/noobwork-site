import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import RevealText from "@/components/ui/RevealText";
import CountUp from "@/components/ui/CountUp";
import { mediaKitStats } from "@/data/stats";
import { contentCategories, partnershipTypes, partnershipProcess } from "@/data/media-kit";
import { BEACONS_URL } from "@/data/external-links";

export const metadata: Metadata = {
  title: "Media Kit",
  description: "Partner with Noobwork. Audience stats, demographics, content verticals, and collaboration opportunities with Joachim Haraldsen.",
  alternates: {
    canonical: "/media-kit",
  },
  openGraph: {
    title: "Media Kit | Noobwork",
    description: "Partner with Noobwork. Audience stats, demographics, and collaboration opportunities.",
  },
};

export default function MediaKit() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main media-kit">
        <section className="site-section site-section--dark mk-hero">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="chapter-head chapter-head--ongreen mk-hero__head">
                <p className="chapter-head__marker">Media Kit / Partnerships</p>
                <h1
                  className="chapter-head__display mk-hero__title"
                  aria-label="Work with Noobwork"
                >
                  <RevealText text="Work with" />
                  <br />
                  <span className="chapter-head__display-accent">
                    <RevealText text="Noobwork." delay={0.15} />
                  </span>
                </h1>
                <p className="chapter-head__note mk-hero__note">
                  I&apos;ve spent over a decade building authentic communities,
                  first in gaming and esports, now in fitness and lifestyle.
                  Here&apos;s what a partnership with me looks like.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="site-section site-section--tight mk-stats-section">
          <div className="shell-inner">
            <AnimatedSection>
              <dl className="partner-stats mk-stats">
                {mediaKitStats.map((stat) => (
                  <div key={stat.label} className="partner-stat" data-magnetic>
                    <dt className="partner-stat__label">{stat.label}</dt>
                    <dd className="partner-stat__value">
                      {stat.numericValue != null ? (
                        <CountUp target={stat.numericValue} suffix={stat.suffix} />
                      ) : (
                        stat.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </AnimatedSection>
          </div>
        </section>

        <div className="mk-content">
          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head">
                <p className="chapter-head__marker">01 / Audience</p>
                <h2 className="chapter-head__title">Who watches.</h2>
              </div>
            </AnimatedSection>
            <div className="mk-audience-grid">
              <AnimatedSection delay={0.1}>
                <div className="mk-audience-card" data-tilt>
                  <div className="mk-audience-card__label">Core Age Range</div>
                  <div
                    className="mk-age-range"
                    role="img"
                    aria-label="Core audience age range is 18 to 34"
                  >
                    <div className="mk-age-range__bar" aria-hidden="true">
                      <div className="mk-age-range__seg" style={{ flex: 1 }} />
                      <div className="mk-age-range__seg mk-age-range__seg--active" style={{ flex: 3 }} />
                      <div className="mk-age-range__seg" style={{ flex: 0.6 }} />
                      <div className="mk-age-range__seg" style={{ flex: 0.4 }} />
                    </div>
                    <div className="mk-age-range__labels">
                      <span>13-17</span>
                      <span className="mk-age-range__label--active">18-34</span>
                      <span>35-44</span>
                      <span>45+</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="mk-audience-card" data-tilt>
                  <div className="mk-audience-card__label">Gender Split</div>
                  <div className="mk-bar-chart">
                    <div className="mk-bar-row">
                      <span className="mk-bar-row__label">Male</span>
                      <div className="mk-bar-row__track"><div className="mk-bar-row__fill mk-bar-row__fill--primary" style={{ width: "96%" }} /></div>
                      <span className="mk-bar-row__pct">96%</span>
                    </div>
                    <div className="mk-bar-row">
                      <span className="mk-bar-row__label">Female</span>
                      <div className="mk-bar-row__track"><div className="mk-bar-row__fill mk-bar-row__fill--sand" style={{ width: "4%" }} /></div>
                      <span className="mk-bar-row__pct">4%</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <div className="mk-audience-card" data-tilt>
                  <div className="mk-audience-card__label">Top Regions</div>
                  <div className="mk-region-list">
                    {["Norway", "Sweden"].map((r) => (
                      <span key={r} className="mk-region-tag mk-region-tag--primary"><span className="mk-region-tag__dot" />{r}</span>
                    ))}
                    {["United States", "Denmark"].map((r) => (
                      <span key={r} className="mk-region-tag"><span className="mk-region-tag__dot" />{r}</span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head">
                <p className="chapter-head__marker">02 / Content</p>
                <h2 className="chapter-head__title">What I make.</h2>
              </div>
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

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head">
                <p className="chapter-head__marker">03 / Partnerships</p>
                <h2 className="chapter-head__title">How we work.</h2>
              </div>
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

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head">
                <p className="chapter-head__marker">04 / Process</p>
                <h2 className="chapter-head__title">From brief to live.</h2>
              </div>
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
        </div>

        <section className="site-section mk-finale">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="mk-finale__inner">
                <div className="chapter-head">
                  <p className="chapter-head__marker">Next step</p>
                  <h2
                    className="chapter-head__display partner__display"
                    aria-label="Let's work together"
                  >
                    <RevealText text="Let's work" />
                    <br />
                    <span className="chapter-head__display-accent">
                      <RevealText text="together." delay={0.18} />
                    </span>
                  </h2>
                </div>
                <p className="partner-pitch__copy mk-finale__copy">
                  Interested in a partnership? Reach out directly or follow my
                  Beacons page for updates and announcements.
                </p>
                <div className="hero-actions mk-finale__actions">
                  <a
                    href="mailto:joachim@noobwork.no"
                    className="btn btn--primary"
                    data-magnetic
                  >
                    Get in Touch
                  </a>
                  <a
                    href={BEACONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--secondary"
                    data-magnetic
                  >
                    Follow on Beacons
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <div className="mk-back shell-inner">
          <Link href="/" className="back-link">&larr; Back to home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
