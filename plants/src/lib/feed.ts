import type { PlantWithMeta } from "@/types";

export interface FeedItem {
  id: string;
  title: string;
  url: string;
  date: string;
  summary: string;
  type: "water_due" | "photo_due" | "health_check";
}

export function buildFeedItems(plants: PlantWithMeta[], baseUrl: string): FeedItem[] {
  const today = new Date().toISOString().slice(0, 10);
  const items: FeedItem[] = [];

  for (const plant of plants) {
    const url = `${baseUrl}/plants/${plant.id}`;

    if (plant.waterStatus === "overdue" || plant.waterStatus === "due_today") {
      items.push({
        id: `${plant.id}-water-${today}`,
        title: `${plant.nickname} needs water`,
        url,
        date: today,
        summary: `${plant.species.typeName} in ${plant.room.name} — ${plant.waterStatus === "overdue" ? "overdue" : "due today"}.`,
        type: "water_due",
      });
    }

    if (plant.photoDue) {
      items.push({
        id: `${plant.id}-photo-${today}`,
        title: `Photo check-in: ${plant.nickname}`,
        url,
        date: today,
        summary: `Time for a growth snapshot of your ${plant.species.typeName}.`,
        type: "photo_due",
      });
    }

    if (plant.latestAnalysis?.overallHealth === "concerning") {
      items.push({
        id: `${plant.id}-health-${plant.latestAnalysis.createdAt.slice(0, 10)}`,
        title: `${plant.nickname} needs attention`,
        url,
        date: plant.latestAnalysis.createdAt.slice(0, 10),
        summary: plant.latestAnalysis.summary,
        type: "health_check",
      });
    }
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function buildFeedJson(plants: PlantWithMeta[], baseUrl: string) {
  const items = buildFeedItems(plants, baseUrl);
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: "Plants · Noobwork",
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/feed.json`,
    description: "Watering reminders and plant health updates from the apartment collection.",
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      date_published: `${item.date}T08:00:00+09:00`,
      content_text: item.summary,
      tags: [item.type],
    })),
  };
}
