import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Newsletter() {
  return (
    <section className="site-section">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="newsletter-editorial">
            <h2 className="newsletter-editorial__title" data-shimmer>
              Noobwork Is Back
            </h2>
            <p className="newsletter-editorial__copy">
              I&apos;m documenting the return properly this time: what I&apos;m building, what I&apos;m learning, and what&apos;s changing along the way.
            </p>
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
