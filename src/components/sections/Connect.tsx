import SectionHeader from "@/components/ui/SectionHeader";
import SocialIcon from "@/components/ui/SocialIcon";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { socialLinks } from "@/data/social-links";

export default function Connect() {
  return (
    <section id="connect" className="py-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto text-center">
        <AnimatedSection>
          <SectionHeader title="Let&apos;s" highlight="Connect" subtitle="Find me across the internet or reach out directly." center />
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((social, i) => (
            <AnimatedSection key={social.name} delay={i * 0.1}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex items-center gap-2 px-6 py-3 bg-background rounded-lg border border-border hover:border-primary hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <SocialIcon iconName={social.iconName} />
                <span className="text-foreground">{social.name}</span>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
