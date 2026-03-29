import SectionHeader from "@/components/ui/SectionHeader";
import SocialIcon from "@/components/ui/SocialIcon";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { socialLinks } from "@/data/social-links";

export default function Connect() {
  return (
    <section id="connect" className="site-section">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader title="Let&apos;s" highlight="Connect" subtitle="Find me across the internet or reach out directly." center />
        </AnimatedSection>

        <div className="connect-grid">
          {socialLinks.map((social, i) => (
            <AnimatedSection key={social.name} delay={i * 0.1}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="connect-chip"
              >
                <SocialIcon iconName={social.iconName} />
                <span>{social.name}</span>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
