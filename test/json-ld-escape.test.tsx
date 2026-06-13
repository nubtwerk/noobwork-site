import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Regression for the feed-title injection seam: video titles come from the
// YouTube RSS feed at build time, and the refresh script decodes XML entities
// into raw characters. A title containing "</script>" must never break out of
// the inline JSON-LD script element.
vi.mock("@/data/videos", () => ({
  featuredVideo: {
    id: "AAAAAAAAAAA",
    title: 'Hostile </script><script>alert(1)</script> title',
    date: "Jun 2026",
    publishedIso: "2026-06-01",
  },
  recentVideos: [
    { id: "BBBBBBBBBBB", title: "Normal title", date: "Jun 2026" },
  ],
}));

import JsonLd from "@/components/JsonLd";

describe("JsonLd escaping (hostile feed title)", () => {
  it("never emits a raw </script and still parses back to the original title", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const html = script!.innerHTML;
    expect(html).not.toContain("</script");
    expect(html).not.toContain("<script");
    expect(html).toContain("\\u003c");

    // The escape must be lossless: JSON.parse restores the original title.
    const parsed = JSON.parse(html);
    const list = parsed["@graph"].find(
      (n: { "@type": string }) => n["@type"] === "ItemList"
    );
    expect(list.itemListElement[0].item.name).toBe(
      'Hostile </script><script>alert(1)</script> title'
    );
  });
});
