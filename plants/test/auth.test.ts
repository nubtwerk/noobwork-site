import { describe, expect, it } from "vitest";
import { getAdminEmail, isAdminEmail } from "@/lib/auth";

describe("auth", () => {
  it("allows only the configured admin email", () => {
    const admin = getAdminEmail();
    expect(isAdminEmail(admin)).toBe(true);
    expect(isAdminEmail(admin.toUpperCase())).toBe(true);
    expect(isAdminEmail("other@example.com")).toBe(false);
  });
});
