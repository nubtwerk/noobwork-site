import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BeforeSendEvent } from "@vercel/analytics/react";
import SiteAnalytics from "@/components/ui/SiteAnalytics";

const { analytics } = vi.hoisted(() => ({ analytics: vi.fn((props: { beforeSend: (event: BeforeSendEvent) => BeforeSendEvent | null }) => {
  void props;
  return null;
}) }));
vi.mock("@vercel/analytics/react", () => ({ Analytics: analytics }));

describe("confirmation link analytics privacy", () => {
  it("passes a filter that excludes signed confirmation URLs", () => {
    render(<SiteAnalytics />);
    const filter = analytics.mock.calls[0][0].beforeSend;
    for (const path of ["/follow/confirm?t=private-signed-email", "/follow/confirm/", "/season?t=private-signed-email"]) {
      expect(filter({ type: "pageview", url: `https://www.noobwork.no${path}` })).toBeNull();
      expect(filter({ type: "event", url: `https://www.noobwork.no${path}` })).toBeNull();
    }
    const season: BeforeSendEvent = { type: "pageview", url: "https://www.noobwork.no/season?ref=qa" };
    expect(filter(season)).toBe(season);
    expect(filter({ type: "pageview", url: "invalid" })).toBeNull();
  });
});
