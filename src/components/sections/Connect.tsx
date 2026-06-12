import { ArrowUpRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SocialIcon from "@/components/ui/SocialIcon";
import { socialLinks } from "@/data/social-links";

export default function Connect() {
  return (
    <section id="connect" className="site-section connect">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head chapter-head--onbrown">
            <p className="chapter-head__marker">Everywhere</p>
            <h2 className="chapter-head__title">Let&apos;s Connect.</h2>
            <p className="chapter-head__note">
              Find me across the internet, or reach out directly. If you&apos;re
              a young founder building something real, I&apos;m always happy to
              connect.
            </p>
          </div>
        </AnimatedSection>

        <div className="connect-index">
          {socialLinks.map((social, i) => (
            <AnimatedSection key={social.name} delay={i * 0.07}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="connect-row"
              >
                <span className="connect-row__icon" aria-hidden="true">
                  <SocialIcon iconName={social.iconName} />
                </span>
                <span className="connect-row__name">{social.name}</span>
                <ArrowUpRight className="connect-row__arrow" size={22} aria-hidden="true" />
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
