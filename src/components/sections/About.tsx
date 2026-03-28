import SectionHeader from "@/components/ui/SectionHeader";
import InterestTag from "@/components/ui/InterestTag";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { focusItems } from "@/data/focus-items";
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
          <div className="max-w-3xl space-y-6 text-foreground/80 leading-relaxed text-lg">
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

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <AnimatedSection delay={0.2}>
            <div className="bg-white rounded-2xl p-8 border border-sand/30 h-full">
              <h3 className="font-[family-name:var(--font-newake)] text-xl uppercase tracking-tight text-foreground mb-5">Current Focus</h3>
              <ul className="space-y-3 text-foreground/90">
                {focusItems.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0"></span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="bg-white rounded-2xl p-8 border border-sand/30 h-full">
              <h3 className="font-[family-name:var(--font-newake)] text-xl uppercase tracking-tight text-foreground mb-5">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <InterestTag key={interest} label={interest} />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
