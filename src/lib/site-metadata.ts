import type { Metadata } from "next";

export const SITE_DESCRIPTION = "Joachim Haraldsen, known as Noobwork, is a Norwegian creator and founder based in Seoul. Videos about training, life abroad and building things. Explore content partnerships.";

/** Next replaces nested metadata objects; each route needs a complete object. */
export function socialMetadata(title: string, description: string, path = "/"): Pick<Metadata, "openGraph" | "twitter"> {
  const image = { url: "https://www.noobwork.no/opengraph-image", width: 1200, height: 630, alt: "Noobwork — Joachim Haraldsen" };
  return {
    openGraph: { title, description, url: `https://www.noobwork.no${path}`, siteName: "Noobwork", locale: "en_US", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, creator: "@noobwork", images: [image] },
  };
}
