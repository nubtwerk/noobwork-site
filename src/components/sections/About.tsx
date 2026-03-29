import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function About() {
  return (
    <section id="about" className="site-section site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader title="About" highlight="Joachim" subtitle="The story behind the brand" center />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="about-copy about-copy--wide">
            <p className="about-lead">
              Founder, creator, and operator building a premium lifestyle brand from Japan after two decades across gaming, media, and entrepreneurship.
            </p>
            <p>
              I&apos;m <span className="about-emphasis">Joachim Haraldsen</span>, a Norwegian founder, creator, and operator based in Tokyo. I built <span className="about-emphasis">Noobwork</span> into one of Norway&apos;s biggest gaming channels, growing it to nearly <span className="about-emphasis">200,000 subscribers</span> and helping define an entire category before the creator economy had fully taken shape.
            </p>
            <p>
              I later founded <span className="about-emphasis">Heroic Group</span>, raised <span className="about-emphasis">$25 million</span>, and scaled it into one of the largest esports organisations in the world. That chapter led to a successful exit, a <span className="about-emphasis">Forbes feature</span>, and years spent operating at global scale across gaming, media, and entertainment.
            </p>
            <p>
              Today my work sits at the intersection of content, products, and advisory. I&apos;m rebuilding Noobwork as a premium lifestyle creator brand from Tokyo, advising companies like <span className="about-emphasis">Blast.tv</span> and <span className="about-emphasis">Nåva Space</span>, and building new ventures with a sharper focus on AI, long-term brand, and high-leverage creative work.
            </p>
            <p>
              What ties it all together is taste and trajectory: Tokyo lifestyle, personal growth, fitness, gaming culture, entrepreneurship, and the discipline of building things that last. Noobwork is where those threads now meet.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
