import AnimatedSection from "@/components/ui/AnimatedSection";

const brands = ["Forbes", "Blast.tv", "Heroic", "YouTube", "Nåva Space"];

export default function SocialProof() {
  return (
    <section className="pb-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto text-center">
        <AnimatedSection>
          <p className="text-lg md:text-2xl text-foreground/45 mb-2">
            Featured In &amp; Associated With
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-2xl md:text-4xl font-semibold text-foreground/45 leading-tight">
            {brands.map((brand) => (
              <span key={brand}>
                {brand}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
