"use client";

import { useEffect } from "react";
import { trackSeason } from "@/lib/season-analytics";

/** Reports one view per tab session of a brand link (/season?ref=brand). */
export default function SeasonVisitBeacon({ visitRef }: { visitRef?: string }) {
  useEffect(() => {
    if (!visitRef) return;
    const key = `season-visit:${visitRef}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked; the server still limits repeat alerts.
    }
    trackSeason("season_viewed", { ref: visitRef });
    fetch("/api/season/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: visitRef, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [visitRef]);
  return null;
}
