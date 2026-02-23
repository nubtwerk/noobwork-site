import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    title: "Tokyo Lifestyle",
    desc: "Daily experiences, cultural insights, and the energy of the city — creating relatable connections for our audience.",
    icon: "🏯",
  },
  {
    title: "Personal Development",
    desc: "Guidance on self-improvement, motivation, and building discipline — empowering you to achieve your aspirations.",
    icon: "🎯",
  },
  {
    title: "Gaming Heritage",
    desc: "Combining gaming roots with lifestyle and personal growth — the foundation that started it all.",
    icon: "🎮",
  },
];

export default function ContentPillars() {
  return (
    <section className="py-20 px-6 bg-primary text-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <h2 className="font-[family-name:var(--font-newake)] text-3xl md:text-4xl uppercase tracking-tight mb-2">
            Content Pillars
          </h2>
          <p className="text-white/60 mb-12">What Noobwork is all about</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.title} delay={i * 0.1}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:-translate-y-1 transition-transform">
                <div className="text-3xl mb-4">{pillar.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{pillar.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
