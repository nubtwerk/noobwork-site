import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function About() {
  return (
    <section id="about" className="site-section site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader title="About" highlight="Joachim" subtitle="Why Noobwork is back now" center />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="about-copy about-copy--wide">
            <p className="about-lead">
              Eight years ago I stopped making content to go build things, an esports org I scaled globally and sold, a role shaping gaming strategy for Saudi Arabia&apos;s biggest city project, and a lot of hard lessons along the way. Now I&apos;m back. Living in Tokyo, training, building new ventures, and finally documenting the whole thing.
            </p>
            <p>
              I&apos;m <span className="about-emphasis">Joachim Haraldsen</span>, a Norwegian founder, creator, and operator based in Tokyo. I built <span className="about-emphasis">Noobwork</span> into one of Norway&apos;s biggest gaming channels, growing it to nearly <span className="about-emphasis">200,000 subscribers</span> before the creator economy had fully taken shape.
            </p>
            <p>
              I later founded <span className="about-emphasis">Heroic Group</span>, raised <span className="about-emphasis">$25 million</span>, and helped scale it into one of the largest esports organisations in the world. That chapter led to a successful exit, a <span className="about-emphasis">Forbes feature</span>, and years spent operating across gaming, media, and entertainment at global scale.
            </p>
            <p>
              Today my work sits at the intersection of content, products, and advisory. I&apos;m rebuilding Noobwork from Tokyo, advising companies like <span className="about-emphasis">Blast.tv</span> and <span className="about-emphasis">Nåva Space</span>, and building new ventures with a sharper focus on AI, long-term brand, and high-leverage creative work.
            </p>
            <p>
              I also care a lot about the next generation of builders. I enjoy connecting with young founders, helping them sharpen their thinking, and every now and then backing one early with an angel investment.
            </p>
            <p>
              Noobwork is where those threads now meet, creator roots, founder scars, Tokyo lifestyle, personal growth, and the discipline of building things that last.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
