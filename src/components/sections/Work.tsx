import AnimatedSection from "@/components/ui/AnimatedSection";
import WorkCard from "@/components/ui/WorkCard";
import { workItems } from "@/data/work-items";

export default function Work() {
  return (
    <section id="work" className="site-section">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head">
            <p className="chapter-head__marker">03 / The Portfolio</p>
            <h2 className="chapter-head__title">Work &amp; Ventures.</h2>
            <p className="chapter-head__note">
              Creator work and the companies I&apos;m building across health,
              fitness, and AI, grounded in a track record from gaming and
              esports.
            </p>
          </div>
        </AnimatedSection>

        <div className="index-list">
          {workItems.map((item, i) => (
            <AnimatedSection key={item.name} delay={i * 0.08}>
              <WorkCard item={item} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
