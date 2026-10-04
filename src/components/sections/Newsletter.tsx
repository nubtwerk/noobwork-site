"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import RevealText from "@/components/ui/RevealText";
import FollowSeasonForm from "@/components/ui/FollowSeasonForm";
import { YOUTUBE_CHANNEL_URL } from "@/data/external-links";
import { season } from "@/data/season";

export default function Newsletter() {
  return (
    <section className="site-section signoff">
      <div className="shell-inner">
        <AnimatedSection>
          <div className="signoff-inner">
            <h2 className="signoff__title" aria-label="Noobwork is back">
              <RevealText text="Noobwork Is Back" />
            </h2>
            <p className="signoff__copy">
              This time I&apos;m documenting it properly. Follow along on
              YouTube.
            </p>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--sand"
              data-magnetic
            >
              Subscribe on YouTube
            </a>
            {/* Stays off the homepage until Season 1 is announced. */}
            {season.isPublic ? (
              <div id="follow" className="signoff__follow">
                <p className="signoff__copy">Or get every {season.name} retest by email.</p>
                <FollowSeasonForm from="home" tone="dark" />
              </div>
            ) : null}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
