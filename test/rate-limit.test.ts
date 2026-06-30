import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimitStore } from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitStore();
});

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const opts = { limit: 3, windowMs: 1000, now: 1000 };
    expect(rateLimit("k", opts).allowed).toBe(true);
    expect(rateLimit("k", opts).allowed).toBe(true);
    expect(rateLimit("k", opts).allowed).toBe(true);

    const fourth = rateLimit("k", opts);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("resets once the window has elapsed", () => {
    expect(rateLimit("k", { limit: 1, windowMs: 1000, now: 1000 }).allowed).toBe(true);
    expect(rateLimit("k", { limit: 1, windowMs: 1000, now: 1500 }).allowed).toBe(false);
    expect(rateLimit("k", { limit: 1, windowMs: 1000, now: 2001 }).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const opts = { limit: 1, windowMs: 1000, now: 1000 };
    expect(rateLimit("a", opts).allowed).toBe(true);
    expect(rateLimit("b", opts).allowed).toBe(true);
    expect(rateLimit("a", opts).allowed).toBe(false);
  });

  it("reports the remaining hits in the window", () => {
    const opts = { limit: 5, windowMs: 1000, now: 1000 };
    expect(rateLimit("k", opts).remaining).toBe(4);
    expect(rateLimit("k", opts).remaining).toBe(3);
  });
});
