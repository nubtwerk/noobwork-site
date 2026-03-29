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
                  Stay in the <span className="section-heading__highlight">Loop</span>
                </h2>
                <p className="newsletter-copy">
                  Subscribe through Beacons for updates, new ventures, and behind-the-scenes insights.
                </p>
              </div>
            </div>
            <a
              href="https://beacons.ai/noobwork"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Subscribe on Beacons
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
