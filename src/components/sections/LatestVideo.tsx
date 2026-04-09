"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";

export default function LatestVideo() {
  return (
    <section id="latest-video" className="site-section site-section--tight site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader
            title="Watch"
            highlight="Now"
            subtitle="Min første video på mange år | Day in my life"
            center
          />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="latest-video__wrapper">
            <div className="latest-video__embed">
              <iframe
                src="https://www.youtube-nocookie.com/embed/ndS2iIoEpXc"
                title="Min første video på mange år | Day in my life"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
