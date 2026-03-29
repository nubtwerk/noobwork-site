import SectionHeader from "@/components/ui/SectionHeader";
import WorkCard from "@/components/ui/WorkCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { workItems } from "@/data/work-items";

export default function Work() {
  return (
    <section id="work" className="site-section">
      <div className="shell-inner">
        <div className="work-layout">
          <AnimatedSection className="work-intro">
            <SectionHeader title="Work &" highlight="Ventures" subtitle="Building companies and communities" />
            <p className="work-intro__note">
              A selected mix of founder-led ventures, creator platforms, and advisory roles across media, technology, and culture.
            </p>
          </AnimatedSection>

          <div className="work-stack">
            {workItems.map((item, i) => (
              <AnimatedSection key={item.name} delay={i * 0.08}>
                <WorkCard item={item} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
