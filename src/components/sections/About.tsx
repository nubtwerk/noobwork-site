import SectionHeader from "@/components/ui/SectionHeader";
import InterestTag from "@/components/ui/InterestTag";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { interests } from "@/data/interests";

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
          <div className="md:grid md:grid-cols-[1fr_auto] md:gap-16 items-end">
            <div className="space-y-6 text-foreground/80 leading-relaxed text-lg">
              <p>
                I&apos;m <span className="text-primary font-medium">Joachim Haraldsen</span> — a Norwegian creator and entrepreneur based in Tokyo. In 2013, I created Noobwork and pioneered gaming content on YouTube in Norway, building a community of nearly <span className="font-semibold">200,000 subscribers</span>.
              </p>
              <p>
                I founded <span className="text-primary font-medium">Heroic Group</span> from scratch and built it into one of the largest esports organizations in the world, earning a <span className="font-semibold">Forbes feature</span> along the way. After successfully selling the company, I moved to Tokyo to start the next chapter.
              </p>
              <p>
                Now, after a seven-year hiatus, <span className="text-primary font-medium">Noobwork</span> is back — reimagined as a premium lifestyle brand at the intersection of personal development, <span className="font-semibold">Tokyo lifestyle</span>, and gaming heritage.
              </p>
            </div>
            <div className="mt-8 md:mt-0 md:w-48">
              <h3 className="font-[family-name:var(--font-newake)] text-sm uppercase tracking-wider text-foreground/50 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <InterestTag key={interest} label={interest} />
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
