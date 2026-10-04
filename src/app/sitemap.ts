import type { MetadataRoute } from "next";
import { season } from "@/data/season";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.noobwork.no";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/media-kit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/context`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Listed only once Season 1 is announced; until then the page is noindex.
    ...(season.isPublic
      ? [{ url: `${baseUrl}/season`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
  ];
}
