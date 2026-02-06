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
          <SectionHeader title="About" highlight="Me" subtitle="The story so far" />
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12">
          <AnimatedSection delay={0.1}>
            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <p>
                I&apos;m a Norwegian content creator and entrepreneur who&apos;s been shaping the gaming and esports landscape for over a decade. In 2013, I pioneered content creation on YouTube in Norway, building <span className="text-primary font-medium">Noobwork</span> — my internet persona — into a community of nearly <span className="font-semibold">200,000 subscribers</span>. In a country of 5 million people, reaching this scale in Norwegian-language gaming content is a remarkable achievement.
              </p>
              <p>
                I founded <span className="text-primary font-medium">Heroic Group</span> from scratch and built it into one of the largest esports organizations in the world. The journey earned me recognition with a <span className="font-semibold">Forbes feature</span>, and I successfully sold the company to pursue new ventures.
              </p>
              <p>
                Now based in <span className="font-semibold">Tokyo, Japan</span>, I continue to build at the intersection of gaming, technology, and entertainment.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="space-y-8">
              <div className="bg-background rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Current Focus</h3>
                <ul className="space-y-2 text-foreground/70">
                  {focusItems.map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-background rounded-xl p-6">
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
