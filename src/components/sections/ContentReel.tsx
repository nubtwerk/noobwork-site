"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, ArrowUpRight } from "@phosphor-icons/react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { VideoItem } from "@/data/videos";
import {
  featuredVideo as fallbackFeatured,
  recentVideos as fallbackRecent,
} from "@/data/videos";
import { YOUTUBE_CHANNEL_URL as CHANNEL_URL } from "@/data/external-links";

interface ContentReelProps {
  featuredVideo?: VideoItem;
  recentVideos?: VideoItem[];
}

export default function ContentReel({
  featuredVideo = fallbackFeatured,
  recentVideos = fallbackRecent,
}: ContentReelProps) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // maxresdefault is not guaranteed for every upload; fall back to hqdefault.
  const [thumbTier, setThumbTier] = useState<"max" | "hq">("max");

  // Reset the tier when the featured video changes so a new prop value never
  // keeps showing the previous video's (possibly downgraded) image. This is the
  // React-recommended "adjust state during render" pattern — no effect needed.
  const [lastFeaturedId, setLastFeaturedId] = useState(featuredVideo.id);
  if (featuredVideo.id !== lastFeaturedId) {
    setLastFeaturedId(featuredVideo.id);
    setThumbTier("max");
  }

  const featuredThumb = `https://i.ytimg.com/vi/${featuredVideo.id}/${
    thumbTier === "max" ? "maxresdefault" : "hqdefault"
  }.jpg`;

  // When the facade is replaced by the iframe, move keyboard focus onto the
  // now-playing video so the user's tab position is not dropped to <body>.
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);

  return (
    <section id="reel" className="site-section reel">
      {/* Legacy anchor: external links to /#latest-video predate this section */}
      <span id="latest-video" aria-hidden="true" />
      <div className="shell-inner">
        <AnimatedSection>
          <div className="chapter-head chapter-head--onbrown">
            <p className="chapter-head__marker">The Feed / YouTube</p>
            <h2 className="chapter-head__title">Latest Uploads.</h2>
            <p className="chapter-head__note">
              No highlight reel. Straight from the channel: the grind, the
              travel, and what I&apos;m building.
            </p>
          </div>
        </AnimatedSection>

        <div className="reel-grid">
          <AnimatedSection className="reel-feature" delay={0.08}>
            <div className="reel-feature__embed">
              {playing ? (
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube-nocookie.com/embed/${featuredVideo.id}?autoplay=1`}
                  title={featuredVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="reel-feature__facade"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play video: ${featuredVideo.title}`}
                >
                  <Image
                    src={featuredThumb}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="reel-feature__thumb"
                    onError={() => setThumbTier("hq")}
                  />
                  <span className="reel-feature__play" aria-hidden="true">
                    <Play size={26} weight="fill" />
                  </span>
                </button>
              )}
            </div>
            <div className="reel-feature__caption">
              <span className="reel-feature__date">{featuredVideo.date}</span>
              <p className="reel-feature__title">{featuredVideo.title}</p>
            </div>
          </AnimatedSection>

          <div className="reel-list">
            {recentVideos.map((video, i) => (
              <AnimatedSection key={video.id} delay={0.12 + i * 0.07}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reel-item"
                >
                  <span className="reel-item__thumb-wrap">
                    <Image
                      src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                      alt=""
                      width={320}
                      height={180}
                      sizes="160px"
                      className="reel-item__thumb"
                    />
                  </span>
                  <span className="reel-item__body">
                    <span className="reel-item__date">{video.date}</span>
                    <span className="reel-item__title">{video.title}</span>
                  </span>
                  <ArrowUpRight className="reel-item__arrow" size={18} weight="regular" aria-hidden />
                </a>
              </AnimatedSection>
            ))}
            <AnimatedSection delay={0.4}>
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="reel-subscribe"
              >
                Subscribe on YouTube
                <ArrowUpRight size={16} weight="regular" aria-hidden />
              </a>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
