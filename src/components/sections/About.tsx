import SectionHeader from "@/components/ui/SectionHeader";
import InterestTag from "@/components/ui/InterestTag";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { focusItems } from "@/data/focus-items";
import { interests } from "@/data/interests";

export default function About() {
  return (
    <section id="about" className="py-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            title="About"
            highlight="Joachim"
            subtitle="The story behind the brand"
            highlightClassName="text-accent"
          />
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12">
          <AnimatedSection delay={0.1}>
            <div className="space-y-6 text-foreground/80 leading-relaxed">
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
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              <div className="bg-background rounded-3xl p-8">
                <h3 className="font-semibold text-foreground mb-4">Current Focus</h3>
                <ul className="space-y-1 text-foreground/95 text-[1.05rem] leading-snug">
                  {focusItems.map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <InterestTag key={interest} label={interest} />
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
