/**
 * Unit tests for scripts/refresh-videos.mjs
 * Import using a dynamic import (ESM .mjs from TS vitest environment).
 */

import { describe, it, expect, vi } from "vitest";

// Dynamic import of the ESM script.
const refreshVideos = await import("../scripts/refresh-videos.mjs");
const { parseFeed, formatDisplayDate, isShort } = refreshVideos;

// ---------------------------------------------------------------------------
// parseFeed
// ---------------------------------------------------------------------------

const FIXTURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
 <title>Noobwork</title>
 <entry>
  <id>yt:video:AAAAAAAAAAA</id>
  <yt:videoId>AAAAAAAAAAA</yt:videoId>
  <title>First &amp; Foremost</title>
  <published>2026-06-10T13:30:07+00:00</published>
 </entry>
 <entry>
  <id>yt:video:BBBBBBBBBBB</id>
  <yt:videoId>BBBBBBBBBBB</yt:videoId>
  <title>Second &lt;title&gt; with entities</title>
  <published>2026-06-07T13:30:06+00:00</published>
 </entry>
 <entry>
  <id>yt:video:CCCCCCCCCCC</id>
  <yt:videoId>CCCCCCCCCCC</yt:videoId>
  <title>Third &quot;quoted&quot; title</title>
  <published>2026-05-29T14:00:06+00:00</published>
 </entry>
</feed>`;

describe("parseFeed", () => {
  it("returns one item per entry, in feed order", () => {
    const result = parseFeed(FIXTURE_XML);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("AAAAAAAAAAA");
    expect(result[1].id).toBe("BBBBBBBBBBB");
    expect(result[2].id).toBe("CCCCCCCCCCC");
  });

  it("decodes XML entities in titles", () => {
    const result = parseFeed(FIXTURE_XML);
    expect(result[0].title).toBe("First & Foremost");
    expect(result[1].title).toBe("Second <title> with entities");
    expect(result[2].title).toBe('Third "quoted" title');
  });

  it("preserves publishedIso from each entry", () => {
    const result = parseFeed(FIXTURE_XML);
    expect(result[0].publishedIso).toBe("2026-06-10T13:30:07+00:00");
    expect(result[1].publishedIso).toBe("2026-06-07T13:30:06+00:00");
    expect(result[2].publishedIso).toBe("2026-05-29T14:00:06+00:00");
  });
});

// ---------------------------------------------------------------------------
// formatDisplayDate
// ---------------------------------------------------------------------------

describe("formatDisplayDate", () => {
  it('formats ISO date to "Jun 2026"', () => {
    expect(formatDisplayDate("2026-06-07T00:00:00+00:00")).toBe("Jun 2026");
  });

  it('formats ISO date to "May 2026"', () => {
    expect(formatDisplayDate("2026-05-29T14:00:06+00:00")).toBe("May 2026");
  });
});

// ---------------------------------------------------------------------------
// isShort — injected fake fetch, no real network
// ---------------------------------------------------------------------------

describe("isShort", () => {
  it("returns true when response status is 200 (Short)", async () => {
    const fakeFetch = (async () => ({ status: 200 })) as unknown as typeof fetch;
    const result = await isShort("AAAAAAAAAAA", fakeFetch);
    expect(result).toBe(true);
  });

  it("returns false when response status is 303 (regular video)", async () => {
    const fakeFetch = (async () => ({ status: 303 })) as unknown as typeof fetch;
    const result = await isShort("AAAAAAAAAAA", fakeFetch);
    expect(result).toBe(false);
  });

  it("returns false when response status is 301 (redirect)", async () => {
    const fakeFetch = (async () => ({ status: 301 })) as unknown as typeof fetch;
    const result = await isShort("AAAAAAAAAAA", fakeFetch);
    expect(result).toBe(false);
  });

  it("throws on a 404 so an ambiguous response is not treated as a regular video", async () => {
    const fakeFetch = (async () => ({ status: 404 })) as unknown as typeof fetch;
    await expect(isShort("AAAAAAAAAAA", fakeFetch)).rejects.toThrow(
      /unexpected status 404/
    );
  });

  it("throws on a 429 rate-limit rather than misclassifying a Short as long-form", async () => {
    const fakeFetch = (async () => ({ status: 429 })) as unknown as typeof fetch;
    await expect(isShort("AAAAAAAAAAA", fakeFetch)).rejects.toThrow(/429/);
  });
});

describe("fetchTextWithTimeout", () => {
  it("returns the body text on an ok response", async () => {
    const okFetch = (async () => ({
      ok: true,
      status: 200,
      text: async () => "<feed/>",
    })) as unknown as typeof fetch;
    const text = await refreshVideos.fetchTextWithTimeout(
      "https://example.com",
      10000,
      okFetch
    );
    expect(text).toBe("<feed/>");
  });

  it("throws on a non-ok response so an error page is never parsed as feed XML", async () => {
    const errFetch = (async () => ({
      ok: false,
      status: 503,
      text: async () => "<html>throttled</html>",
    })) as unknown as typeof fetch;
    await expect(
      refreshVideos.fetchTextWithTimeout("https://example.com", 10000, errFetch)
    ).rejects.toThrow(/feed fetch failed: 503/);
  });
});

describe("fetchWithTimeout", () => {
  it("aborts a hanging fetch after the budget and clears the timer", async () => {
    vi.useFakeTimers();
    try {
      let captured: RequestInit | undefined;
      const hangingFetch = ((_url: string, options: RequestInit) => {
        captured = options;
        return new Promise((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
          );
        });
      }) as unknown as typeof fetch;

      const promise = refreshVideos.fetchWithTimeout(
        "https://example.com",
        {},
        8000,
        hangingFetch
      );
      const expectation = expect(promise).rejects.toThrow("Aborted");
      await vi.advanceTimersByTimeAsync(8000);
      await expectation;
      expect(captured?.signal?.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("passes the response through and clears the timer on success", async () => {
    vi.useFakeTimers();
    try {
      const okFetch = (async (_url: string, options: RequestInit) => {
        expect(options.signal).toBeDefined();
        return { status: 200 };
      }) as unknown as typeof fetch;
      const res = await refreshVideos.fetchWithTimeout(
        "https://example.com",
        {},
        8000,
        okFetch
      );
      expect(res.status).toBe(200);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("isSameVideoContent", () => {
  const base = {
    generatedAt: "2026-06-13T00:00:00Z",
    featured: { id: "AAAAAAAAAAA", title: "T", date: "Jun 2026", publishedIso: "2026-06-10" },
    recent: [{ id: "BBBBBBBBBBB", title: "U", date: "Jun 2026", publishedIso: "2026-06-07" }],
  };

  it("ignores generatedAt differences", () => {
    const other = { ...base, generatedAt: "2099-01-01T00:00:00Z" };
    expect(refreshVideos.isSameVideoContent(base, other)).toBe(true);
  });

  it("detects changed video content", () => {
    const other = { ...base, featured: { ...base.featured, id: "CCCCCCCCCCC" } };
    expect(refreshVideos.isSameVideoContent(base, other)).toBe(false);
  });

  it("detects a changed recent list", () => {
    const other = { ...base, recent: [] };
    expect(refreshVideos.isSameVideoContent(base, other)).toBe(false);
  });
});
