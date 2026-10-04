import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SocialIcon from "@/components/ui/SocialIcon";
import { socialLinks } from "@/data/social-links";
import { ADVISORY_HREF, MEDIA_KIT_HREF, MEDIA_KIT_INQUIRY_HREF } from "@/lib/constants";

export default function Connect() {
  return (
    <section id="connect" className="site-section connect">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head chapter-head--onbrown">
            <p className="chapter-head__marker">Everywhere</p>
            <h2 className="chapter-head__title">Let&apos;s Connect.</h2>
            <p className="chapter-head__note">
              Find me across the internet, or reach out directly. Founders at
              early-stage startups and scale‑ups can{" "}
              <Link href={ADVISORY_HREF}>reach me about advisory</Link>
              . Brands can{" "}
              <Link href={MEDIA_KIT_HREF} data-partnership-source="connect">
                explore the media kit
              </Link>{" "}
              or{" "}
              <Link href={MEDIA_KIT_INQUIRY_HREF} data-partnership-source="connect">
                send a brief
              </Link>
              .
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
                <ArrowUpRight className="connect-row__arrow" size={22} weight="regular" aria-hidden />
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
