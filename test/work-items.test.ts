import { describe, it, expect } from "vitest";
import { workItems } from "@/data/work-items";

describe("work-items data", () => {
  it("has 5 work items", () => {
    expect(workItems).toHaveLength(5);
  });

  it("primary linked items have URLs", () => {
    const named = ["Heroic Group", "Noobwork", "DailyBase.ai"];
    for (const name of named) {
      const item = workItems.find((w) => w.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item!.url, `${name} should have a URL`).toBeTruthy();
    }
  });

  it("advisory companies have URLs", () => {
    const advisory = workItems.find((w) => w.name === "Advisory & Angel");
    expect(advisory).toBeDefined();
    expect(advisory?.companies).toBeDefined();
    expect(advisory?.companies).toHaveLength(4);

    for (const company of advisory?.companies ?? []) {
      expect(company.url, `${company.name} should have a URL`).toBeTruthy();
    }
  });

  it("non-public ventures do not have URLs", () => {
    const stealth = workItems.filter((w) => w.name.startsWith("Stealth"));
    const privateItems = [...stealth];
    expect(privateItems.length).toBeGreaterThanOrEqual(1);
    for (const item of privateItems) {
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
