import AnimatedSection from "@/components/ui/AnimatedSection";
import WorkCard from "@/components/ui/WorkCard";
import { workItems } from "@/data/work-items";

const groups = [
  { label: "Now", items: workItems.filter((item) => item.phase !== "Past") },
  { label: "Before", items: workItems.filter((item) => item.phase === "Past") },
].filter((group) => group.items.length > 0);

export default function Work() {
  return (
    <section id="work" className="site-section">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head">
            <p className="chapter-head__marker">03 / The Portfolio</p>
            <h2 className="chapter-head__title">Work &amp; Ventures.</h2>
            <p className="chapter-head__note">
              Creator work and advisory for founders, grounded in a track
              record from gaming and esports.
            </p>
          </div>
        </AnimatedSection>

        {groups.map((group) => (
          <div key={group.label} className="work-group">
            <h3 className="work-group__label">{group.label}</h3>
            <div className="index-list">
              {group.items.map((item, i) => (
                <AnimatedSection key={item.name} delay={i * 0.08}>
                  <WorkCard item={{ ...item, phase: undefined }} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
