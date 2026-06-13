import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import JsonLd from "@/components/JsonLd";
import { recentVideos } from "@/data/videos";

describe("JsonLd structured data", () => {
  function getSchema() {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.innerHTML);
    return json;
  }

  it("renders a valid JSON-LD script tag that parses without error", () => {
    const schema = getSchema();
    expect(schema).toBeTruthy();
    expect(schema["@context"]).toBe("https://schema.org");
  });

  it("@graph contains exactly one Person with name 'Joachim Haraldsen'", () => {
    const schema = getSchema();
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

  it("@graph contains exactly one ItemList with the correct number of entries", () => {
    const schema = getSchema();
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
    // 1 featured + recentVideos.length
    expect(items).toHaveLength(1 + recentVideos.length);
  });

  it("every VideoObject has name, thumbnailUrl containing its id, and correct watch url", () => {
    const schema = getSchema();
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

  it("serialized JSON contains no </script substring (injection guard)", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script!.innerHTML).not.toContain("</script");
  });
});
