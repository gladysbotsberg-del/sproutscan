import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Upstash Redis rate limiting with in-memory fallback for local dev
// ---------------------------------------------------------------------------

const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// --- Upstash implementation ------------------------------------------------

let scanLimiter: Ratelimit | null = null;
let searchLimiter: Ratelimit | null = null;

if (hasRedis) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // 20 requests per 60 s sliding window (matches SCAN_LIMIT / SCAN_WINDOW)
  scanLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "ratelimit:scan",
  });

  // 40 requests per 60 s sliding window (matches SEARCH_LIMIT / SEARCH_WINDOW)
  searchLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(40, "60 s"),
    prefix: "ratelimit:search",
  });
}

// Cache the reset timestamp from the last `.limit()` call so `getRetryAfter`
// can return a meaningful value without an extra round-trip.
const resetCache = new Map<string, number>();

function pickLimiter(maxRequests: number): Ratelimit {
  // 20 → scan, 40 → search; default to scan for anything else
  return maxRequests <= 20 ? scanLimiter! : searchLimiter!;
}

// --- In-memory fallback (local dev / missing env vars) ---------------------

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const memStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of memStore) {
    if (now > entry.resetTime) {
      memStore.delete(key);
    }
  }
}

function memRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  cleanup();

  const now = Date.now();
  const entry = memStore.get(ip);

  if (!entry || now > entry.resetTime) {
    memStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: maxRequests - entry.count };
}

function memGetRetryAfter(ip: string): number {
  const entry = memStore.get(ip);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetTime - Date.now()) / 1000));
}

// --- Public API (same signatures as before) --------------------------------

export async function rateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  if (!hasRedis) {
    return memRateLimit(ip, maxRequests, windowMs);
  }

  const limiter = pickLimiter(maxRequests);
  const result = await limiter.limit(ip);

  // Cache reset so getRetryAfter can use it
  resetCache.set(`${ip}:${maxRequests}`, result.reset);

  return { success: result.success, remaining: result.remaining };
}

export function getRetryAfter(ip: string): number {
  if (!hasRedis) {
    return memGetRetryAfter(ip);
  }

  // Check both cached resets, return the largest remaining seconds
  let maxRetry = 0;
  for (const [key, reset] of resetCache) {
    if (key.startsWith(`${ip}:`)) {
      const seconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      maxRetry = Math.max(maxRetry, seconds);
    }
  }
  return maxRetry;
}
