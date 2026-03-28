import AnimatedSection from "@/components/ui/AnimatedSection";

const brands = [
  { name: "Forbes", emphasis: true },
  { name: "Blast.tv" },
  { name: "Heroic" },
  { name: "YouTube" },
  { name: "Nåva Space" },
];

export default function SocialProof() {
  return (
    <section className="pb-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto text-center">
        <AnimatedSection>
          <p className="text-sm md:text-base text-foreground/50 uppercase tracking-wider mb-6">
            Featured In &amp; Associated With
          </p>
          <div className="flex flex-wrap justify-center items-baseline gap-x-8 gap-y-3 md:gap-x-12">
            {brands.map((brand) => (
              <span
                key={brand.name}
                className={`font-[family-name:var(--font-newake)] uppercase tracking-tight ${
                  brand.emphasis
                    ? "text-3xl md:text-5xl text-foreground/70"
                    : "text-2xl md:text-4xl text-foreground/40"
                }`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
