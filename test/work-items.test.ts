import { describe, it, expect } from "vitest";
import { workItems } from "@/data/work-items";

describe("work-items data", () => {
  it("has 4 work items", () => {
    expect(workItems).toHaveLength(4);
  });

  it("primary linked items have URLs", () => {
    const named = ["Noobwork", "Team Haraldsen", "DailyBase.ai", "Heroic Group"];
    for (const name of named) {
      const item = workItems.find((w) => w.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item!.url, `${name} should have a URL`).toBeTruthy();
    }
  });

  it("uses the canonical YouTube handle URL", () => {
    const noobwork = workItems.find((w) => w.name === "Noobwork");
    expect(noobwork?.url).toBe("https://www.youtube.com/@Noobworkify");
  });

  it("all items have name, role, and desc", () => {
    for (const item of workItems) {
      expect(item.name).toBeTruthy();
      expect(item.role).toBeTruthy();
      expect(item.desc).toBeTruthy();
    }
  });
});
