import { Gamepad2, MapPinned, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    title: "Tokyo Lifestyle",
    desc: "Daily experiences, cultural insights, and the energy of the city, creating relatable connections for our audience.",
    icon: MapPinned,
    tone: "green",
  },
  {
    title: "Personal Development",
    desc: "Guidance on self-improvement, motivation, and building discipline, empowering you to achieve your aspirations.",
    icon: Sparkles,
    tone: "purple",
  },
  {
    title: "Gaming Heritage",
    desc: "Combining gaming roots with lifestyle and personal growth, the foundation that started it all.",
    icon: Gamepad2,
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
                <div className="pillar-card__icon">
                  <pillar.icon size={18} aria-hidden="true" />
                </div>
                <h3 className="pillar-card__title">{pillar.title}</h3>
                <p className="pillar-card__copy">{pillar.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
