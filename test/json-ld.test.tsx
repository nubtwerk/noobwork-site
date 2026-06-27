import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import JsonLd from "@/components/JsonLd";

vi.mock("@/lib/get-videos", () => ({
  getLatestVideos: vi.fn(async () => ({
    featuredVideo: {
      id: "AAAAAAAAAAA",
      title: "Featured from feed",
      date: "Jun 2026",
      publishedIso: "2026-06-24T14:30:22+00:00",
    },
    recentVideos: [
      {
        id: "BBBBBBBBBBB",
        title: "Recent from feed",
        date: "Jun 2026",
        publishedIso: "2026-06-20T16:30:21+00:00",
      },
    ],
  })),
}));

describe("JsonLd structured data", () => {
  async function getSchema() {
    const element = await JsonLd();
    const { container } = render(element);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.innerHTML);
    return json;
  }

  it("renders a valid JSON-LD script tag that parses without error", async () => {
    const schema = await getSchema();
    expect(schema).toBeTruthy();
    expect(schema["@context"]).toBe("https://schema.org");
  });

  it("@graph contains exactly one Person with name 'Joachim Haraldsen'", async () => {
    const schema = await getSchema();
    const graph: unknown[] = schema["@graph"];
    expect(Array.isArray(graph)).toBe(true);
    const persons = graph.filter(
      (node) =>
        typeof node === "object" &&
        node !== null &&
        (node as Record<string, unknown>)["@type"] === "Person"
    );
    expect(persons).toHaveLength(1);
    expect((persons[0] as Record<string, unknown>).name).toBe(
      "Joachim Haraldsen"
    );
  });

  it("@graph contains exactly one ItemList with the correct number of entries", async () => {
    const schema = await getSchema();
    const graph: unknown[] = schema["@graph"];
    const lists = graph.filter(
      (node) =>
        typeof node === "object" &&
        node !== null &&
        (node as Record<string, unknown>)["@type"] === "ItemList"
    );
    expect(lists).toHaveLength(1);
    const list = lists[0] as Record<string, unknown>;
    const items = list.itemListElement as unknown[];
    expect(items).toHaveLength(2);
  });

  it("every VideoObject has name, thumbnailUrl containing its id, and correct watch url", async () => {
    const schema = await getSchema();
    const graph: unknown[] = schema["@graph"];
    const list = graph.find(
      (node) =>
        typeof node === "object" &&
        node !== null &&
        (node as Record<string, unknown>)["@type"] === "ItemList"
    ) as Record<string, unknown>;
    const items = list.itemListElement as Array<Record<string, unknown>>;

    for (const listItem of items) {
      const video = listItem.item as Record<string, string>;
      expect(video["@type"]).toBe("VideoObject");
      expect(typeof video.name).toBe("string");
      expect(video.name.length).toBeGreaterThan(0);
      expect(video.thumbnailUrl).toContain(video.url.split("?v=")[1]);
      expect(video.url).toMatch(
        /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/
      );
    }
  });

  it("serialized JSON contains no </script substring (injection guard)", async () => {
    const element = await JsonLd();
    const { container } = render(element);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script!.innerHTML).not.toContain("</script");
  });
});
