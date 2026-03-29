import AnimatedSection from "@/components/ui/AnimatedSection";
import PillarIcon, { type PillarIconKind } from "@/components/ui/PillarIcon";

const pillars: Array<{
  title: string;
  desc: string;
  icon: PillarIconKind;
  tone: "green" | "purple" | "sand";
}> = [
  {
    title: "Lifestyle",
    desc: "Taste, rituals, and perspective, currently shaped through life in Japan.",
    icon: "lifestyle",
    tone: "green",
  },
  {
    title: "Personal Development",
    desc: "Focus, discipline, and long-term growth, grounded in real life rather than hype.",
    icon: "development",
    tone: "purple",
  },
  {
    title: "Gaming Heritage",
    desc: "The competitive roots behind the brand, now carried forward with more taste and range.",
    icon: "heritage",
    tone: "sand",
  },
];

export default function ContentPillars() {
  return (
    <section className="site-section site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="section-heading">
            <h2 className="section-heading__title section-heading__title--primary">Content Pillars</h2>
            <p className="section-heading__subtitle">What Noobwork is all about</p>
          </div>
        </AnimatedSection>

        <div className="pillar-grid">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.title} delay={i * 0.1}>
              <div className={`pillar-card pillar-card--${pillar.tone}`}>
                <div className="pillar-card__top">
                  <div className="pillar-card__icon" aria-hidden="true">
                    <PillarIcon kind={pillar.icon} className="pillar-card__icon-mark" />
                  </div>
                </div>
                <div className="pillar-card__body">
                  <h3 className="pillar-card__title">{pillar.title}</h3>
                  <p className="pillar-card__copy">{pillar.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
