import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    title: "Tokyo Lifestyle",
    desc: "Daily experiences, cultural insights, and the energy of the city — creating relatable connections for our audience.",
    icon: "🏯",
    bg: "bg-sand",
    text: "text-background",
  },
  {
    title: "Personal Development",
    desc: "Guidance on self-improvement, motivation, and building discipline — empowering you to achieve your aspirations.",
    icon: "🎯",
    bg: "bg-accent",
    text: "text-background",
  },
  {
    title: "Gaming Heritage",
    desc: "Combining gaming roots with lifestyle and personal growth — the foundation that started it all.",
    icon: "🎮",
    bg: "bg-brown",
    text: "text-background",
  },
];

export default function ContentPillars() {
  return (
    <section className="py-20 px-6 bg-primary">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <h2 className="font-[family-name:var(--font-newake)] text-3xl md:text-4xl uppercase tracking-tight mb-2 text-background">
            Content Pillars
          </h2>
          <p className="text-background/60 mb-10">What Noobwork is all about</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.title} delay={i * 0.1}>
              <div className={`${pillar.bg} ${pillar.text} rounded-2xl p-8 min-h-[200px] flex flex-col justify-end`}>
                <div className="text-2xl mb-3">{pillar.icon}</div>
                <h3 className="font-[family-name:var(--font-newake)] text-xl uppercase tracking-tight mb-2">{pillar.title}</h3>
                <p className="text-sm leading-relaxed opacity-85">{pillar.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
