import { Mail } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Newsletter() {
  return (
    <section className="site-section site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="newsletter-block">
            <Mail className="newsletter-icon" size={36} aria-hidden="true" />
            <h2 className="newsletter-title">
              Stay in the <span className="section-heading__highlight">Loop</span>
            </h2>
            <p className="newsletter-copy">
              Subscribe through Beacons for newsletter updates, new ventures, and behind-the-scenes insights.
            </p>
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
