import AnimatedSection from "@/components/ui/AnimatedSection";

const brands = ["Forbes", "Blast.tv", "Heroic", "YouTube", "Nåva Space"];

export default function SocialProof() {
  return (
    <section className="py-12 px-6 bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto text-center">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-widest text-foreground/40 mb-6">
            Featured In &amp; Associated With
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {brands.map((brand) => (
              <span key={brand} className="text-foreground/30 font-semibold text-lg md:text-xl">
                {brand}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
