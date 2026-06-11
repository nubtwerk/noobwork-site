"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";

const VIDEO_ID = "6Dt2jvU7Z-w";
const VIDEO_TITLE = "Første push day tilbake i Norge | Trening";

export default function LatestVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="latest-video" className="site-section site-section--tight site-section--surface">
      <div className="shell-inner">
        <AnimatedSection>
          <SectionHeader
            title="Watch"
            highlight="Now"
            subtitle={VIDEO_TITLE}
            center
          />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="latest-video__wrapper">
            <div className="latest-video__embed">
              {playing ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`}
                  title={VIDEO_TITLE}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="latest-video__facade"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play video: ${VIDEO_TITLE}`}
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                    alt=""
                    fill
                    sizes="(max-width: 840px) 100vw, 800px"
                    className="latest-video__thumb"
                  />
                  <span className="latest-video__play" aria-hidden="true">
                    <Play size={28} fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
