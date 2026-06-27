import AnimatedSection from "@/components/ui/AnimatedSection";
import RevealText from "@/components/ui/RevealText";
import ParallaxImage from "@/components/ui/ParallaxImage";
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
              <RevealText text="Creator roots." />
              <br />
              <span className="chapter-head__display-accent">
                <RevealText text="Founder scars." delay={0.2} />
              </span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="story-grid">
          <AnimatedSection delay={0.1} className="story-copy">
            <p className="story-lead">
              I stopped making content to go build things, an esports org I
              scaled globally and sold, a role shaping gaming strategy for Saudi
              Arabia&apos;s biggest city project, and a lot of hard lessons
              along the way. Now I&apos;m back. Living in Seoul, training every
              day, building in health and fitness, and finally documenting the
              whole thing.
            </p>
            <p>
              I&apos;m <span className="about-emphasis">Joachim Haraldsen</span>, a Norwegian founder, creator, and operator based in Seoul. I built <span className="about-emphasis">Noobwork</span> into one of Norway&apos;s biggest gaming channels, growing it to <span className="about-emphasis">{profileFacts.subscribers.long} subscribers</span> before the creator economy had fully taken shape.
            </p>
            <p>
              I later founded <span className="about-emphasis">Heroic Group</span>, raised <span className="about-emphasis">$25 million</span>, and helped scale it into one of the largest esports organisations in the world. That chapter led to a successful exit, a <span className="about-emphasis">Forbes feature</span>, and years spent operating across gaming, media, and entertainment at global scale.
            </p>
            <p>
              Today my work sits at the intersection of content, health, and products. I&apos;m rebuilding Noobwork from Seoul with daily content, coaching a community through <span className="about-emphasis">Team Haraldsen</span>, and building <span className="about-emphasis">DailyBase</span>, the first product surface of an AI-native platform for personalized wellness. No guilt, no diet-shaming, just structure that works.
            </p>
            <p>
              I also care a lot about the next generation of builders. I enjoy connecting with young founders, helping them sharpen their thinking, and every now and then backing one early with an angel investment.
            </p>
            <p>
              Noobwork is where those threads now meet, creator roots, founder scars, the fitness grind, personal growth, and the discipline of building things that last.
            </p>
          </AnimatedSection>

          <div className="story-side">
            <AnimatedSection delay={0.18}>
              <ParallaxImage
                src="/atmosphere/atmosphere-seoul-street.jpg"
                alt="Bukchon Hanok Village alley in Seoul at golden hour"
                width={900}
                height={1200}
                sizes="(max-width: 1023px) 100vw, 24rem"
                range={45}
                caption="Seoul. The new home base."
              />
            </AnimatedSection>
            <AnimatedSection delay={0.26}>
              <div className="story-now">
                <p className="story-now__label">Currently</p>
                <ul className="story-now__list">
                  {focusItems.map((item) => (
                    <li key={item.label} className="story-now__item">
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
