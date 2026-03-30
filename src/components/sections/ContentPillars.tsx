import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars: Array<{
  title: string;
  desc: string;
  tone: "green" | "purple" | "sand";
}> = [
  {
    title: "Lifestyle",
    desc: "Japanese culture and routines, taste, training, and the daily details that shape how I think and live.",
    tone: "green",
  },
  {
    title: "Personal Development",
    desc: "Discipline, mindset, relentless focus, and long-term self-development, grounded in real work, not empty advice.",
    tone: "purple",
  },
  {
    title: "Gaming Heritage",
    desc: "The competitive background that built Noobwork, and the lessons from gaming that still carry forward.",
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
                  <span className="pillar-card__number" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
