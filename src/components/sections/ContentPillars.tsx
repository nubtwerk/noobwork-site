import AnimatedSection from "@/components/ui/AnimatedSection";
import ParallaxImage from "@/components/ui/ParallaxImage";

const pillars: Array<{
  title: string;
  desc: string;
  tone: "green" | "purple" | "sand";
}> = [
  {
    title: "Fitness & Wellness",
    desc: "Training, nutrition, and the daily routines behind the grind, documented honestly from Seoul.",
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
    <section className="site-section pillars">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head chapter-head--ongreen">
            <p className="chapter-head__marker">02 / Content Pillars</p>
            <h2 className="chapter-head__title">What I Make.</h2>
            <p className="chapter-head__note">The three themes shaping what I make now</p>
          </div>
        </AnimatedSection>

        <div className="pillars-grid">
          <div className="pillars-list">
            {pillars.map((pillar, i) => (
              <AnimatedSection key={pillar.title} delay={i * 0.1}>
                <div className={`pillar-row pillar-row--${pillar.tone}`}>
                  <span className="pillar-row__number" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pillar-row__body">
                    <h3 className="pillar-row__title">{pillar.title}</h3>
                    <p className="pillar-row__copy">{pillar.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.2} className="pillars-media">
            <ParallaxImage
              src="/atmosphere/atmosphere-gym-dawn.jpg"
              alt="Empty gym at dawn, chalk dust in a shaft of warm light"
              width={929}
              height={1161}
              sizes="(max-width: 1023px) 100vw, 22rem"
              range={50}
              caption="The work happens whether the camera is on or not."
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
