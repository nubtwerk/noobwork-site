import { beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "@vercel/analytics";
import { trackPartnership } from "@/lib/partnership-analytics";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
beforeEach(() => { vi.mocked(track).mockReset(); });

describe("partnership analytics privacy", () => {
  it("records only known source and offer labels", () => {
    trackPartnership("partnership_cta_clicked", { source: "featured-series", offer: "series" });
    expect(track).toHaveBeenCalledWith("partnership_cta_clicked", { source: "featured-series", offer: "series" });
    trackPartnership("partnership_cta_clicked", { source: "connect" });
    expect(track).toHaveBeenCalledWith("partnership_cta_clicked", { source: "connect" });
    trackPartnership("inquiry_submitted", { source: "alex@example.com", offer: "My private message" });
    expect(track).toHaveBeenLastCalledWith("inquiry_submitted", {});
    trackPartnership("inquiry_failed", { offer: "video" });
    expect(track).toHaveBeenLastCalledWith("inquiry_failed", { offer: "video" });
    trackPartnership("inquiry_rate_limited", { offer: "series", source: "utm_source=secret" });
    expect(track).toHaveBeenLastCalledWith("inquiry_rate_limited", { offer: "series" });
  });
  it("does not break the interaction if analytics fails", () => {
    vi.mocked(track).mockImplementation(() => { throw new Error("Unavailable"); });
    expect(() => trackPartnership("inquiry_started")).not.toThrow();
  });
});
