import SectionHeader from "@/components/ui/SectionHeader";
import InterestTag from "@/components/ui/InterestTag";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { focusItems } from "@/data/focus-items";
import { interests } from "@/data/interests";

export default function About() {
  return (
    <section id="about" className="site-section site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader title="About" highlight="Joachim" subtitle="The story behind the brand" />
        </AnimatedSection>

        <div className="about-grid">
          <AnimatedSection delay={0.1}>
            <div className="about-copy">
              <p>
                I&apos;m <span className="about-emphasis">Joachim Haraldsen</span>, a Norwegian creator and entrepreneur based in Tokyo. In 2013, I created Noobwork and pioneered gaming content on YouTube in Norway, building a community of nearly <span className="about-emphasis">200,000 subscribers</span>.
              </p>
              <p>
                I founded <span className="about-emphasis">Heroic Group</span> from scratch and built it into one of the largest esports organizations in the world, earning a <span className="about-emphasis">Forbes feature</span> along the way. After successfully selling the company, I moved to Tokyo to start the next chapter.
              </p>
              <p>
                Now, after a seven-year hiatus, <span className="about-emphasis">Noobwork</span> is back, reimagined as a premium lifestyle brand at the intersection of personal development, <span className="about-emphasis">Tokyo lifestyle</span>, and gaming heritage.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="about-sidebar">
              <div className="site-panel site-panel--sand">
                <h3 className="panel-title">Current Focus</h3>
                <ul className="bullet-list">
                  {focusItems.map((item) => (
                    <li key={item.label}>{item.label}</li>
                  ))}
                </ul>
              </div>
              <div className="site-panel site-panel--white">
                <h3 className="panel-title">Interests</h3>
                <div className="tag-list">
                  {interests.map((interest) => (
                    <InterestTag key={interest} label={interest} />
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
