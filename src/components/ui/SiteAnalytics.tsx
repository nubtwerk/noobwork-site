"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

/** Confirmation links contain signed email data and must never enter analytics. */
export function filterAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    if (url.pathname === "/follow/confirm" || url.pathname === "/follow/confirm/" || url.searchParams.has("t")) {
      return null;
    }
    return event;
  } catch {
    return null;
  }
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={filterAnalyticsEvent} />;
}
