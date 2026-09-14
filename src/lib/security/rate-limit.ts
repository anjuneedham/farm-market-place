/**
 * Fixed-window rate limiting.
 *
 * In-memory and therefore per-instance — documented as a known limitation in
 * docs/SECURITY.md §10. A Redis implementation satisfies the same interface.
 */

export type RateLimitRule = { limit: number; windowMs: number };

export const RATE_LIMITS = {
  signIn: { limit: 8, windowMs: 15 * 60_000 },
  signUp: { limit: 5, windowMs: 60 * 60_000 },
  passwordReset: { limit: 5, windowMs: 60 * 60_000 },
  createListing: { limit: 20, windowMs: 60 * 60_000 },
  createFarmUpdate: { limit: 10, windowMs: 60 * 60_000 },
  sendMessage: { limit: 60, windowMs: 60 * 60_000 },
  createPost: { limit: 20, windowMs: 60 * 60_000 },
  report: { limit: 10, windowMs: 60 * 60_000 },
  search: { limit: 120, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitKind = keyof typeof RATE_LIMITS;

type Bucket = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as { __agriloopRateBuckets?: Map<string, Bucket> };
const buckets = (globalForLimiter.__agriloopRateBuckets ??= new Map<string, Bucket>());

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(kind: RateLimitKind, identifier: string): RateLimitResult {
  const rule = RATE_LIMITS[kind];
  const key = `${kind}:${identifier}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= rule.limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;

  // Opportunistic cleanup keeps the map from growing without bound.
  if (buckets.size > 10_000) {
    for (const [existingKey, existingBucket] of buckets) {
      if (existingBucket.resetAt <= now) buckets.delete(existingKey);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
