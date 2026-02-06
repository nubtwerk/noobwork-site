import SectionHeader from "@/components/ui/SectionHeader";
import WorkCard from "@/components/ui/WorkCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { workItems } from "@/data/work-items";

export default function Work() {
  return (
    <section id="work" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <SectionHeader title="Work &" highlight="Ventures" subtitle="Building companies and communities" />
        </AnimatedSection>

        <div className="space-y-6">
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
