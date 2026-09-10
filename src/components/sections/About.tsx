import AnimatedSection from "@/components/ui/AnimatedSection";
import RevealText from "@/components/ui/RevealText";
import Image from "next/image";
import { focusItems } from "@/data/focus-items";
import { profileFacts } from "@/data/profile-facts";

export default function About() {
  return (
    <section id="about" className="site-section">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head">
            <p className="chapter-head__marker">01 / The Story</p>
            <h2 className="chapter-head__display" aria-label="Creator roots. Founder scars.">
              <RevealText text="Creator roots." /><br />
              <span className="chapter-head__display-accent"><RevealText text="Founder scars." delay={0.2} /></span>
            </h2>
          </div>
        </AnimatedSection>
        <div className="story-grid">
          <AnimatedSection delay={0.1} className="story-copy">
            <p className="story-lead">I&apos;m <span className="about-emphasis">Joachim Haraldsen</span>, a Norwegian creator and founder living in Seoul. Gaming brought me to YouTube. It grew into a career in content and company building.</p>
            <p>I started Noobwork on YouTube in 2013. The channel grew to <span className="about-emphasis">{profileFacts.subscribers.long} subscribers</span>, with videos that became the foundation for everything that followed.</p>
            <p>I later founded Omaken, which acquired Heroic and became <span className="about-emphasis">Heroic Group</span>. That chapter took me into esports, leadership and the work of building a company across borders. <a className="story-source-link" href="https://www.forbes.com/sites/mattgardner1/2022/11/11/truly-heroic-meet-the-inspirational-owner-of-norways-esports-powerhouse/" target="_blank" rel="noopener noreferrer">Read the Forbes profile from 2022 ↗</a></p>
            <p>Today my videos follow training, travel, everyday life in Korea, and the things I&apos;m building along the way. I also work on health and fitness through Team Haraldsen and my product projects.</p>
          </AnimatedSection>
          <div className="story-side">
            <AnimatedSection delay={0.18}>
              <figure className="parallax-figure story-portrait">
                <div className="parallax-figure__frame">
                  <Image src="/joachim.jpg" alt="Joachim Haraldsen, known as Noobwork" fill sizes="(max-width: 1023px) 90vw, 24rem" className="story-portrait__image" />
                </div>
                <figcaption className="parallax-figure__caption">Joachim Haraldsen / Noobwork</figcaption>
              </figure>
            </AnimatedSection>
            <AnimatedSection delay={0.26}>
              <div className="story-now"><p className="story-now__label">Currently</p><ul className="story-now__list">{focusItems.map((item) => <li key={item.label} className="story-now__item">{item.label}</li>)}</ul></div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
