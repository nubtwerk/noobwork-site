import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";
import { parseContactPayload } from "@/lib/contact";
import { __resetRateLimitStore } from "@/lib/rate-limit";

const inquiry = {
  name: "Alex Brand",
  email: "alex@example.com",
  company: "Example",
  message: "We would like to discuss a sponsored training video next month.",
};

beforeEach(() => {
  __resetRateLimitStore();
  vi.stubEnv("RESEND_API_KEY", "test-only");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"id":"test"}')));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("contact request boundaries", () => {
  it("rejects an oversized streamed body without Content-Length before sending", async () => {
    const request = new Request("https://www.noobwork.no/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...inquiry, name: "x".repeat(70_000) }),
    });
    expect((await POST(request)).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("supports native forms and redirects without putting draft details in the URL", async () => {
    const request = new Request("https://www.noobwork.no/api/contact", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://www.noobwork.no" },
      body: new URLSearchParams({ ...inquiry, offer: "series", timing: "October", budget: "To discuss" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://www.noobwork.no/media-kit?inquiry=sent#inquiry");
    expect(response.headers.get("location")).not.toContain(inquiry.email);
    expect(fetch).toHaveBeenCalledOnce();
    const sent = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(sent.text).toContain("Partner on a series");
    expect(sent.text).toContain("October");
  });

  it("preserves and escapes native drafts when delivery fails", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("unavailable", { status: 503 }));
    const message = '</textarea><script>alert("private draft")</script> This is the campaign brief.';
    const response = await POST(new Request("https://www.noobwork.no/api/contact", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...inquiry, message, offer: "series", timing: "October" }),
    }));
    expect(response.status).toBe(502);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    const html = await response.text();
    expect(html).toContain('value="alex@example.com"');
    expect(html).toContain('value="series" selected');
    expect(html).toContain('value="October"');
    expect(html).toContain("&lt;/textarea&gt;&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain('form method="post" action="/api/contact"');
  });

  it("preserves a native draft at the rate limit", async () => {
    for (let i = 0; i < 6; i++) {
      await POST(new Request("https://www.noobwork.no/api/contact", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(inquiry),
      }));
    }
    const response = await POST(new Request("https://www.noobwork.no/api/contact", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(inquiry),
    }));
    expect(response.status).toBe(429);
    expect(await response.text()).toContain(inquiry.message);
  });

  it("rejects cross-origin form posts without sending", async () => {
    const response = await POST(new Request("https://www.noobwork.no/api/contact", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://unrelated.example" },
      body: new URLSearchParams(inquiry),
    }));
    expect(fetch).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it.each([
    { name: "x".repeat(121) },
    { company: "x".repeat(161) },
    { email: `${"a".repeat(250)}@example.com` },
    { name: "Alex\r\nInjected" },
    { offer: "unknown-package" },
    { timing: "x".repeat(121) },
  ])("rejects oversized or invalid fields: %j", (patch) => {
    expect(parseContactPayload({ ...inquiry, ...patch })).toHaveProperty("error");
  });
});
