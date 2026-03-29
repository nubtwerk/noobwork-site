import AnimatedSection from "@/components/ui/AnimatedSection";
import PillarIcon, { type PillarIconKind } from "@/components/ui/PillarIcon";

const pillars: Array<{
  title: string;
  desc: string;
  icon: PillarIconKind;
  tone: "green" | "purple" | "sand";
  compactTitle?: boolean;
}> = [
  {
    title: "Lifestyle",
    desc: "Japanese culture and routines, taste, training, and the daily details that shape how I think and live.",
    icon: "lifestyle",
    tone: "green",
  },
  {
    title: "Personal Development",
    desc: "Discipline, mindset, relentless focus, and long-term self-development, grounded in real work, not empty advice.",
    icon: "development",
    tone: "purple",
    compactTitle: true,
  },
  {
    title: "Gaming Heritage",
    desc: "The competitive background that built Noobwork, and the lessons from gaming that still carry forward.",
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
            <p className="section-heading__subtitle">The three themes shaping what I make now</p>
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
                  <h3 className={`pillar-card__title${pillar.compactTitle ? " pillar-card__title--compact" : ""}`}>
                    {pillar.title}
                  </h3>
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
