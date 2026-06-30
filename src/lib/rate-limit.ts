/**
 * Minimal in-memory, fixed-window rate limiter.
 *
 * Best-effort by design: the counter lives in the module scope of a single
 * serverless instance, so it throttles a burst hitting one warm instance but
 * resets on cold start and is not shared across instances. It exists to make
 * an unauthenticated, side-effectful endpoint (the contact form, which sends
 * real email) costly to flood — pair it with a platform/edge limit (Vercel
 * WAF, Upstash Ratelimit, etc.) when hard cross-instance guarantees are needed.
 */
export interface RateLimitOptions {
  /** Max allowed hits per window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
  /** Injectable clock for tests. */
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining hits in the current window. */
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
/** Prune expired buckets once the map grows past this, bounding memory. */
const PRUNE_THRESHOLD = 500;
/** Hard ceiling on tracked keys; oldest are evicted under a unique-key flood. */
const MAX_BUCKETS = 10_000;

const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Record one hit for `key` and report whether it is allowed. The first hit of a
 * new window is always allowed; subsequent hits are allowed until `limit` is
 * reached within `windowMs`.
 */
export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const now = options.now ?? Date.now();

  if (buckets.size > PRUNE_THRESHOLD) prune(now);

  const existing = buckets.get(key);

  // At capacity, deny a brand-new key (fail closed) rather than evicting an
  // existing, possibly actively-throttled, client. A unique-key flood (e.g.
  // spoofed IPs) thus cannot reset legitimate clients' windows or grow memory
  // past the cap. prune() above already dropped expired keys, so the size here
  // reflects only live windows.
  if (!existing && buckets.size >= MAX_BUCKETS) {
    return { allowed: false, remaining: 0, resetAt: now + windowMs };
  }

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Test-only: clear all recorded windows. */
export function __resetRateLimitStore(): void {
  buckets.clear();
}
