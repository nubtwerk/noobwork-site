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
            <SectionHeader title="Work &" highlight="Ventures" subtitle="What I&apos;m building, advising, and backing now" />
            <p className="work-intro__note">
              A focused mix of creator work, companies I&apos;m building, advisory work, and selective early-stage backing across media, AI, technology, and culture.
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
