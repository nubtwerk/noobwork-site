import AnimatedSection from "@/components/ui/AnimatedSection";

const brands = ["Forbes", "Blast.tv", "Heroic", "YouTube", "Nåva Space"];

export default function SocialProof() {
  return (
    <section className="site-section site-section--tight">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="social-proof">
            <p className="social-proof__eyebrow">Featured In &amp; Associated With</p>
            <p className="social-proof__list">{brands.join("   ")}</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
