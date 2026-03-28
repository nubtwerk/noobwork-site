import { describe, it, expect } from "vitest";
import { workItems } from "@/data/work-items";

describe("work-items data", () => {
  it("has 6 work items", () => {
    expect(workItems).toHaveLength(6);
  });

  it("items with known companies have URLs", () => {
    const named = ["Heroic Group", "Noobwork", "Blast.tv", "Nåva Space"];
    for (const name of named) {
      const item = workItems.find((w) => w.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item!.url, `${name} should have a URL`).toBeTruthy();
    }
  });

  it("stealth startups do not have URLs", () => {
    const stealth = workItems.filter((w) => w.name.startsWith("Stealth"));
    expect(stealth.length).toBeGreaterThanOrEqual(2);
    for (const item of stealth) {
      expect(item.url).toBeUndefined();
    }
  });

  it("all items have name, status, and desc", () => {
    for (const item of workItems) {
      expect(item.name).toBeTruthy();
      expect(item.status).toBeTruthy();
      expect(item.desc).toBeTruthy();
    }
  });
});
