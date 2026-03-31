import { describe, it, expect } from "vitest";
import { socialLinks } from "@/data/social-links";

describe("social-links data", () => {
  it("has 5 social links", () => {
    expect(socialLinks).toHaveLength(5);
  });

  it("all links have name, url, and iconName", () => {
    for (const link of socialLinks) {
      expect(link.name).toBeTruthy();
      expect(link.url).toBeTruthy();
      expect(link.iconName).toBeTruthy();
    }
  });

  it("all http links have valid URL format", () => {
    for (const link of socialLinks) {
      if (link.url.startsWith("http")) {
        expect(() => new URL(link.url)).not.toThrow();
      }
    }
  });

  it("email link uses mailto protocol", () => {
    const email = socialLinks.find((l) => l.iconName === "mail");
    expect(email).toBeDefined();
    expect(email!.url).toMatch(/^mailto:/);
  });
});
