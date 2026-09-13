import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AtmosphereBackdrop from "@/components/ui/AtmosphereBackdrop";
import ContactForm from "@/components/ui/ContactForm";
import RevealText from "@/components/ui/RevealText";
import CountUp from "@/components/ui/CountUp";
import ScrollToHash from "@/components/ui/ScrollToHash";
import { mediaKitStats } from "@/data/stats";
import { partnershipProcess } from "@/data/media-kit";
import { isPartnershipOffer, partnershipOffers, recentReach, recentReachIsReady, selectedWork, workViewsObservedAt, workViewsSource } from "@/data/partnerships";
import { parseInquiryAttribution } from "@/lib/inquiry-attribution";
import { socialMetadata } from "@/lib/site-metadata";

const description = "Sponsored videos, series partnerships and content for your brand. Explore Noobwork's work and send Joachim Haraldsen a partnership brief.";
export const metadata: Metadata = {
  title: "Partnerships",
  description,
  alternates: { canonical: "/media-kit" },
  ...socialMetadata("Partnerships | Noobwork", description, "/media-kit"),
};

function formatUtcDay(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Query = Record<string, string | string[] | undefined>;
export default async function MediaKit({ searchParams }: { searchParams?: Promise<Query> } = {}) {
  const query = await searchParams ?? {};
  const offer = isPartnershipOffer(query.offer) ? query.offer : "";
  const feedback = typeof query.inquiry === "string" ? query.inquiry : undefined;
  const attribution = parseInquiryAttribution(
    Object.fromEntries(
      Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
    ),
  ) ?? {};

  return (
    <div className="site-shell">
      <Nav />
      <ScrollToHash id="inquiry" trigger={`${offer}|${feedback ?? ""}`} force={Boolean(feedback)} />
      <main id="main-content" className="site-main media-kit">
        <section className="site-section mk-hero">
          <AtmosphereBackdrop imagePosition="center 42%" priority />
          <div className="shell-inner mk-hero__stage">
            <AnimatedSection>
              <div className="chapter-head chapter-head--ongreen mk-hero__head">
                <p className="chapter-head__marker">Partnerships</p>
                <h1 className="chapter-head__display mk-hero__title" aria-label="Work with Noobwork">
                  <RevealText text="Work with" /><br />
                  <span className="chapter-head__display-accent"><RevealText text="Noobwork." delay={0.15} /></span>
                </h1>
                <p className="chapter-head__note mk-hero__note">
                  I&apos;m Joachim Haraldsen, a Norwegian creator based in Seoul.
                  I make content about training, life abroad and building things.
                  Here&apos;s what we can make together.
                </p>
                <div className="hero-actions mk-hero__actions">
                  <a href="#offers" className="btn btn--sand" data-partnership-source="media-kit-hero">Explore the formats</a>
                  <a href="#inquiry" className="btn btn--tertiary" data-partnership-source="media-kit-hero">Send a brief</a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="site-section site-section--tight mk-stats-section" aria-label="Channel history">
          <div className="shell-inner">
            <p className="mk-evidence-note">Channel history · rounded milestones, not campaign reach</p>
            <AnimatedSection>
              <dl className="partner-stats mk-stats">
                {mediaKitStats.map((stat) => (
                  <div key={stat.label} className="partner-stat">
                    <dt className="partner-stat__label">{stat.label}</dt>
                    <dd className="partner-stat__value">
                      {stat.numericValue != null ? <CountUp target={stat.numericValue} suffix={stat.suffix} /> : stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </AnimatedSection>
          </div>
        </section>

        <section className="site-section site-section--tight mk-reach-section" aria-labelledby="recent-reach-title">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="chapter-head mk-reach-head">
                <p className="chapter-head__marker">Recent reach</p>
                <h2 id="recent-reach-title" className="chapter-head__title">Studio window.</h2>
              </div>
              <p className="mk-evidence-note">
                {recentReachIsReady() && recentReach.observedAt ? (
                  <>
                    Channel totals from {recentReach.sourceLabel}, checked{" "}
                    <time dateTime={recentReach.observedAt}>{formatUtcDay(recentReach.observedAt)}</time>
                    . {recentReach.sourceDetail}. Not a guarantee for a new campaign.
                  </>
                ) : (
                  <>
                    Channel totals from a dated {recentReach.sourceLabel} export after owner review
                    — not estimated demographics. Figures appear here once that review is recorded.
                  </>
                )}
              </p>
              <dl className="partner-stats mk-reach-stats">
                {recentReach.metrics.map((metric) => (
                  <div key={metric.id} className="partner-stat">
                    <dt className="partner-stat__label">{metric.label}</dt>
                    <dd className="partner-stat__value mk-reach-value">
                      {metric.value ?? "—"}
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
              <div className="chapter-head"><p className="chapter-head__marker">01 / The content</p><h2 className="chapter-head__title">From Seoul.</h2></div>
            </AnimatedSection>
            <div className="mk-content-intro">
              <p>Norwegian-language videos about training, travel and everyday life in Korea, shaped by my background in gaming and company building.</p>
              <p>A good partnership starts with a product that belongs in the story. We agree the audience fit, content format and reporting window as part of the brief.</p>
              <div className="mk-region-list" aria-label="Content themes">
                {["Training & nutrition", "Life in Korea", "Travel", "Gaming heritage"].map((theme) => <span key={theme} className="mk-region-tag mk-region-tag--primary">{theme}</span>)}
              </div>
            </div>
          </section>

          <section className="mk-work-section" aria-labelledby="selected-work-title">
            <AnimatedSection>
              <div className="chapter-head"><p className="chapter-head__marker">02 / Selected work</p><h2 id="selected-work-title" className="chapter-head__title">See the stories.</h2></div>
              <p className="mk-evidence-note">Organic videos, shared as examples of my content.</p>
            </AnimatedSection>
            <div className="mk-work-grid">
              {selectedWork.map((video, index) => (
                <AnimatedSection key={video.id} delay={index * 0.08}>
                  <a className="mk-work-card" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                    <Image src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" width={480} height={360} sizes="(max-width: 767px) 90vw, 320px" className="mk-work-card__image" />
                    <span className="mk-work-card__category">{video.category}</span>
                    <h3>{video.title}</h3>
                    <p>{video.views.toLocaleString("en-US")} views · <time dateTime={video.published}>{new Date(`${video.published}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time></p>
                    <span className="mk-work-card__watch">Watch on YouTube ↗</span>
                  </a>
                </AnimatedSection>
              ))}
            </div>
            <p className="mk-evidence-note">Lifetime views for these videos, checked <time dateTime={workViewsObservedAt}>{formatUtcDay(workViewsObservedAt)}</time>. <a href={workViewsSource}>Public YouTube source</a>. Individual examples do not predict a new campaign&apos;s reach.</p>
          </section>

          <section id="offers" className="mk-editorial mk-anchor">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">03 / The formats</p><h2 className="chapter-head__title">Make it yours.</h2></div>
            </AnimatedSection>
            <ul className="mk-numbered-list">
              {partnershipOffers.map((item, index) => (
                <AnimatedSection as="li" key={item.id} className="mk-numbered-item" delay={index * 0.08}>
                  <span className="mk-numbered-item__num" aria-hidden="true">0{index + 1}</span>
                  <h3 className="mk-numbered-item__title">{item.title}</h3>
                  <div className="mk-numbered-item__desc mk-offer-copy">
                    <p>{item.description}</p>
                    <ul className="mk-deliverables">{item.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}</ul>
                    <p>{item.detail}</p>
                    <Link className="btn btn--secondary" href={`/media-kit?offer=${item.id}#inquiry`} data-partnership-source="media-kit-offer" data-partnership-offer={item.id}>Discuss this format <span className="sr-only">— {item.title}</span></Link>
                  </div>
                </AnimatedSection>
              ))}
            </ul>
          </section>

          <section className="mk-featured-partner" aria-labelledby="featured-partner-title">
            <AnimatedSection>
              <p className="chapter-head__marker">Featured partnership</p>
              <h2 id="featured-partner-title" className="chapter-head__title">Support the next<br />Seoul series.</h2>
              <p>A recurring place in a series about training and life in Korea, with a featured partner card here for the agreed term.</p>
              <p>Let&apos;s agree the story, number of episodes, dates and fee together. The featured placement is offered to one series partner at a time.</p>
              <Link href="/media-kit?offer=series#inquiry" className="btn btn--primary" data-partnership-source="featured-series" data-partnership-offer="series">Discuss the series partnership</Link>
            </AnimatedSection>
          </section>

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">04 / The process</p><h2 className="chapter-head__title">From brief to live.</h2></div>
            </AnimatedSection>
            <div className="mk-process-grid">
              {partnershipProcess.map((step, index) => (
                <AnimatedSection key={step.title} delay={index * 0.08}>
                  <div className="mk-process-step">
                    <div className="mk-process-step__num" aria-hidden="true">{step.step}</div>
                    <h3 className="mk-process-step__title">{step.title}</h3>
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
              <div className="mk-finale__layout">
                <div className="mk-finale__intro">
                  <div className="chapter-head">
                    <p className="chapter-head__marker">Next step</p>
                    <h2 className="chapter-head__display partner__display" aria-label="Let's work together">
                      <RevealText text="Let's work" /><br />
                      <span className="chapter-head__display-accent"><RevealText text="together." delay={0.18} /></span>
                    </h2>
                  </div>
                  <p className="partner-pitch__copy mk-finale__copy">Tell me what you&apos;re making and who you want to reach. Include your campaign timing and budget range if you have them.</p>
                  <p className="mk-evidence-note">For events, speaking or advisory work, use the same form and tell me what you have in mind.</p>
                </div>
                <div id="inquiry" className="mk-inquiry">
                  <ContactForm initialOffer={offer} feedback={feedback} initialAttribution={attribution} />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
        <div className="mk-back shell-inner"><Link href="/" className="back-link">&larr; Back to home</Link></div>
      </main>
      <Footer />
    </div>
  );
}
