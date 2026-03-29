import { Mail } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Newsletter() {
  return (
    <section className="site-section site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="newsletter-band">
            <div className="newsletter-band__copy">
              <Mail className="newsletter-icon" size={34} aria-hidden="true" />
              <div>
                <p className="newsletter-kicker">Newsletter</p>
                <h2 className="newsletter-title">
                  Noobwork Is <span className="section-heading__highlight">Back</span>
                </h2>
                <p className="newsletter-copy">
                  I&apos;m documenting the return properly this time: what I&apos;m building, what I&apos;m learning, and what&apos;s changing along the way.
                </p>
              </div>
            </div>
            <a
              href="https://beacons.ai/noobwork"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Follow the Return
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
