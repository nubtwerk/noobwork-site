import SectionHeader from "@/components/ui/SectionHeader";
import WorkCard from "@/components/ui/WorkCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { workItems } from "@/data/work-items";

export default function Work() {
  return (
    <section id="work" className="site-section">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader title="Work &" highlight="Ventures" subtitle="Building companies and communities" />
        </AnimatedSection>

        <div className="work-stack">
          {workItems.map((item, i) => (
            <AnimatedSection key={item.name} delay={i * 0.1}>
              <WorkCard item={item} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
