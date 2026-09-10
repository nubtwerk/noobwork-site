import { SITE_DESCRIPTION } from "@/lib/site-metadata";
import { socialLinks } from "@/data/social-links";
import type { VideoItem } from "@/data/videos";
import { getLatestVideos } from "@/lib/get-videos";

function toVideoObject(v: VideoItem) {
  const obj: Record<string, string> = {
    "@type": "VideoObject",
    name: v.title,
    description: `${v.title}. Video by Joachim Haraldsen (Noobwork).`,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
  };
  if (v.publishedIso !== undefined) {
    obj.uploadDate = v.publishedIso;
  }
  return obj;
}

export default async function JsonLd({ includeVideos = true, includePerson = true }: { includeVideos?: boolean; includePerson?: boolean } = {}) {
  const videos = includeVideos ? await getLatestVideos() : null;

  const personSchema = {
    "@type": "Person",
    name: "Joachim Haraldsen",
    alternateName: "Noobwork",
    url: "https://www.noobwork.no",
    image: "https://www.noobwork.no/joachim.jpg",
    email: "mailto:joachim@noobwork.no",
    description: SITE_DESCRIPTION,
    jobTitle: "Creator & Entrepreneur",
    sameAs: socialLinks
      .filter((link) => link.url.startsWith("http"))
      .map((link) => link.url),
    knowsAbout: [
      "Fitness & Training",
      "Nutrition",
      "Personal Development",
      "Content Creation",
      "Entrepreneurship",
      "Gaming",
      "Esports",
      "Executive Leadership",
      "Media & Publishing",
    ],
    nationality: {
      "@type": "Country",
      name: "Norway",
    },
    workLocation: {
      "@type": "City",
      name: "Seoul",
    },
    // Point machine readers at the self-authored AI-context layer.
    subjectOf: {
      "@type": "WebPage",
      "@id": "https://www.noobwork.no/context",
      url: "https://www.noobwork.no/context",
      name: "AI Context: Joachim Haraldsen (Noobwork)",
      description:
        "Self-authored, structured context about Joachim Haraldsen for AI systems and researchers. Machine-readable at https://www.noobwork.no/llms.txt",
    },
  };

  const allVideos = videos ? [videos.featuredVideo, ...videos.recentVideos] : [];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      ...(includePerson ? [personSchema] : []),
      ...(includeVideos ? [{
        "@type": "ItemList",
        name: "Latest videos by Noobwork",
        itemListElement: allVideos.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: toVideoObject(v),
        })),
      }] : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escape < so externally-sourced titles (YouTube feed) can never break
      // out of the inline script element; \u003c parses back to < in JSON.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
