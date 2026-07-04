import type { SeoulWeatherNudge } from "@/types";

const SEOUL = { lat: 37.5665, lon: 126.978 };

let cache: { at: number; data: SeoulWeatherNudge } | null = null;
const CACHE_MS = 60 * 60 * 1000;

export async function getSeoulWeatherNudge(): Promise<SeoulWeatherNudge | null> {
  if (process.env.OPEN_METEO_ENABLED === "false") return null;

  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.data;

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(SEOUL.lat));
    url.searchParams.set("longitude", String(SEOUL.lon));
    url.searchParams.set("current", "relative_humidity_2m,temperature_2m");
    url.searchParams.set("timezone", "Asia/Seoul");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      current?: { relative_humidity_2m?: number; temperature_2m?: number };
    };
    const humidity = json.current?.relative_humidity_2m ?? 50;
    const temperature = json.current?.temperature_2m ?? 20;

    let intervalAdjustDays = 0;
    let message = "Conditions are average — stick to your normal schedule.";

    if (humidity >= 75) {
      intervalAdjustDays = 1;
      message =
        "Seoul air is humid today. Soil dries slower — consider waiting an extra day before watering.";
    } else if (humidity <= 35 || temperature >= 30) {
      intervalAdjustDays = -1;
      message =
        "Dry or hot day in Seoul. Check soil a day sooner than usual — indoor heating/AC dries pots faster.";
    }

    const data: SeoulWeatherNudge = {
      humidity,
      temperature,
      message,
      intervalAdjustDays,
    };
    cache = { at: now, data };
    return data;
  } catch {
    return null;
  }
}
