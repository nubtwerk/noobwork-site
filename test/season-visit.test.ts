import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/season/visit/route";
import { __resetRateLimitStore } from "@/lib/rate-limit";
import { formatVisitAlert, parseReferrerHost, parseVisitRef } from "@/lib/season-visit";

function visit(body: unknown, ip = "1.2.3.4", headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/season/visit", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
    body: JSON.stringify(body),
  });
}

function sentEmails() {
  return vi.mocked(fetch).mock.calls.map(([, init]) => JSON.parse(String(init?.body)));
}

beforeEach(() => {
  __resetRateLimitStore();
  process.env.RESEND_API_KEY = "re_test_key";
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("{}", { status: 200 })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
});

describe("brand link refs", () => {
  it("accepts simple brand labels only", () => {
    expect(parseVisitRef("Aker")).toBe("aker");
    expect(parseVisitRef("aker-biomarine")).toBe("aker-biomarine");
    expect(parseVisitRef("-aker")).toBeUndefined();
    expect(parseVisitRef("aker\nBcc: x")).toBeUndefined();
    expect(parseVisitRef("a".repeat(41))).toBeUndefined();
    expect(parseVisitRef(["aker"])).toBeUndefined();
  });

  it("keeps only the referrer host", () => {
    expect(parseReferrerHost("https://www.linkedin.com/feed/?x=secret")).toBe("www.linkedin.com");
    expect(parseReferrerHost("not a url")).toBeUndefined();
  });

  it("formats the alert in Seoul time", () => {
    const { subject, text } = formatVisitAlert({ ref: "aker", country: "NO", city: "Oslo", device: "desktop", at: new Date("2026-10-04T06:00:00Z") });
    expect(subject).toBe("Season link opened: aker");
    expect(text).toContain("Oslo, NO");
    expect(text).toContain("15:00");
  });
});

describe("POST /api/season/visit", () => {
  it("emails Joachim once per visitor and brand link", async () => {
    const headers = { "x-vercel-ip-country": "NO", "x-vercel-ip-city": "Bergen", "user-agent": "Mozilla/5.0 (iPhone)" };
    expect((await POST(visit({ ref: "aker", referrer: "https://mail.google.com/mail/u/0" }, "2.2.2.2", headers))).status).toBe(204);
    expect((await POST(visit({ ref: "aker" }, "2.2.2.2", headers))).status).toBe(204);
    const emails = sentEmails();
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toEqual(["joachim@noobwork.no"]);
    expect(emails[0].subject).toBe("Season link opened: aker");
    expect(emails[0].text).toContain("Bergen, NO");
    expect(emails[0].text).toContain("phone or tablet");
    expect(emails[0].text).toContain("mail.google.com");
  });

  it("ignores visits without a valid ref and cross-site beacons", async () => {
    expect((await POST(visit({}))).status).toBe(204);
    expect((await POST(visit({ ref: "<script>" }))).status).toBe(204);
    expect((await POST(visit({ ref: "aker" }, "3.3.3.3", { origin: "https://evil.example" }))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("caps alerts overall so made-up refs can't flood the inbox", async () => {
    for (let i = 0; i < 35; i++) await POST(visit({ ref: `brand-${i}` }, `9.9.9.${i}`));
    expect(sentEmails()).toHaveLength(30);
  });

  it("never fails the page when email sending fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 500 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(visit({ ref: "aker" }))).status).toBe(204);
  });
});
