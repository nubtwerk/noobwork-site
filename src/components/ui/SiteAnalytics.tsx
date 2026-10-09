"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

/** Confirmation links contain signed email data or bid tokens and must never enter analytics. */
export function filterAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    if (/^\/(?:follow|season)\/confirm\/?$/.test(url.pathname) || url.searchParams.has("t") || url.searchParams.has("token")) {
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
