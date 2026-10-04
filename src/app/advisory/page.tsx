import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AtmosphereBackdrop from "@/components/ui/AtmosphereBackdrop";
import RevealText from "@/components/ui/RevealText";
import { profileFacts } from "@/data/profile-facts";
import { ADVISORY_MAILTO } from "@/lib/constants";
import { socialMetadata } from "@/lib/site-metadata";

const description = "Joachim Haraldsen is open to advisory, board and select operator roles with early-stage startups and scale-ups in gaming, media, AI and frontier tech.";
export const metadata: Metadata = {
  title: "Advisory",
  description,
  alternates: { canonical: "/advisory" },
  ...socialMetadata("Advisory | Noobwork", description, "/advisory"),
};

const focusAreas = [
  {
    title: "Company building",
    description: "Founding, acquiring and scaling a company, and building teams across borders.",
  },
  {
    title: "Audience and content",
    description: "Building a brand people follow, and how creators and companies work together.",
  },
  {
    title: "Gaming and esports",
    description: "The market, the partners and how the ecosystem actually works.",
  },
];

const engagements = [
  {
    title: "Advisor",
    description: "Regular sessions with a founder or leadership team, on an agreed term.",
  },
  {
    title: "Board",
    description: "A board or advisory board seat where I can add real value.",
  },
  {
    title: "Operator roles",
    description: "Select hands-on roles, when the company and the timing are right.",
  },
];

export default function Advisory() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main media-kit">
        <section className="site-section mk-hero">
          <AtmosphereBackdrop imagePosition="center 42%" priority />
          <div className="shell-inner mk-hero__stage">
            <AnimatedSection>
              <div className="chapter-head chapter-head--ongreen mk-hero__head">
                <p className="chapter-head__marker">Advisory</p>
                <h1 className="chapter-head__display mk-hero__title" aria-label="Built it. Now I advise.">
                  <RevealText text="Built it." /><br />
                  <span className="chapter-head__display-accent"><RevealText text="Now I advise." delay={0.15} /></span>
                </h1>
                <p className="chapter-head__note mk-hero__note">
                  I&apos;m open to advisory, board and select operator roles with
                  early-stage startups and scale-ups in gaming, media, AI and
                  frontier tech.
                </p>
                <div className="hero-actions mk-hero__actions">
                  <a href={ADVISORY_MAILTO} className="btn btn--sand">Get in touch</a>
                  <a href="#background" className="btn btn--tertiary">My background</a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <div className="mk-content">
          <section id="background" className="mk-editorial mk-anchor">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">01 / Background</p><h2 className="chapter-head__title">What I&apos;ve built.</h2></div>
            </AnimatedSection>
            <div className="mk-content-intro">
              <p>I started Noobwork on YouTube in 2013 and grew it to {profileFacts.subscribers.long} subscribers.</p>
              <p>
                I founded Omaken, which acquired Heroic and became Heroic Group. That meant running a company,
                doing deals and building teams across borders.{" "}
                <a className="story-source-link" href="https://www.forbes.com/sites/mattgardner1/2022/11/11/truly-heroic-meet-the-inspirational-owner-of-norways-esports-powerhouse/" target="_blank" rel="noopener noreferrer">Read the Forbes profile from 2022 ↗</a>
              </p>
              <p>Today I live in Seoul, make content and build products. I take on a small number of advisory roles alongside that.</p>
            </div>
          </section>

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">02 / Where I help</p><h2 className="chapter-head__title">What I know.</h2></div>
            </AnimatedSection>
            <ul className="mk-numbered-list">
              {focusAreas.map((item, index) => (
                <AnimatedSection as="li" key={item.title} className="mk-numbered-item" delay={index * 0.08}>
                  <span className="mk-numbered-item__num" aria-hidden="true">0{index + 1}</span>
                  <h3 className="mk-numbered-item__title">{item.title}</h3>
                  <div className="mk-numbered-item__desc"><p>{item.description}</p></div>
                </AnimatedSection>
              ))}
            </ul>
          </section>

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">03 / Ways to work</p><h2 className="chapter-head__title">Keep it simple.</h2></div>
            </AnimatedSection>
            <div className="mk-process-grid">
              {engagements.map((item, index) => (
                <AnimatedSection key={item.title} delay={index * 0.08}>
                  <div className="mk-process-step">
                    <div className="mk-process-step__num" aria-hidden="true">0{index + 1}</div>
                    <h3 className="mk-process-step__title">{item.title}</h3>
                    <p className="mk-process-step__desc">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </div>

        <section className="site-section mk-finale">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="chapter-head">
                <p className="chapter-head__marker">Next step</p>
                <h2 className="chapter-head__display partner__display" aria-label="Tell me what you're building">
                  <RevealText text="Tell me what" /><br />
                  <span className="chapter-head__display-accent"><RevealText text="you're building." delay={0.18} /></span>
                </h2>
              </div>
              <p className="partner-pitch__copy mk-finale__copy">
                Email me with what you&apos;re building, your stage and where you want help.
              </p>
              <div className="hero-actions">
                <a href={ADVISORY_MAILTO} className="btn btn--primary">Email joachim@noobwork.no</a>
              </div>
              <p className="mk-evidence-note">Brand partnerships go through the <Link href="/media-kit">media kit</Link>.</p>
            </AnimatedSection>
          </div>
        </section>
        <div className="mk-back shell-inner"><Link href="/" className="back-link">&larr; Back to home</Link></div>
      </main>
      <Footer />
    </div>
  );
}
