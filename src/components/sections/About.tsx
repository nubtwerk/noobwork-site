import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function About() {
  return (
    <section id="about" className="py-20 px-6 bg-gradient-to-b from-surface to-surface/80">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            title="About"
            highlight="Joachim"
            subtitle="The story behind the brand"
            highlightClassName="text-accent"
          />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-3xl space-y-6 text-foreground/80 leading-relaxed text-lg">
            <p>
              I&apos;m <span className="text-primary font-medium">Joachim Haraldsen</span> — a Norwegian creator and entrepreneur based in Tokyo. For over two decades, I&apos;ve built companies, communities, and content at the intersection of gaming, media, and entertainment.
            </p>
            <p>
              In 2013, I created <span className="text-primary font-medium">Noobwork</span> and pioneered gaming content on YouTube in Norway, building a community of nearly <span className="font-semibold">200,000 subscribers</span> and over <span className="font-semibold">150 million views</span>. Along the way, I published six books — including a national bestseller — and won multiple awards for best gaming channel in the country.
            </p>
            <p>
              I went on to found <span className="text-primary font-medium">Heroic Group</span>, raising <span className="font-semibold">$25 million</span> and building one of the largest esports organizations in the world with a team spanning 20+ countries. The journey earned a <span className="font-semibold">Forbes feature</span> and culminated in a successful exit in 2023.
            </p>
            <p>
              After advising on esports for <span className="text-primary font-medium">Qiddiya</span>, Saudi Arabia&apos;s landmark entertainment destination, I moved to Tokyo to start the next chapter. Now, after a seven-year hiatus, Noobwork is back — reimagined as a premium lifestyle brand blending personal development, Tokyo lifestyle, and gaming heritage.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
