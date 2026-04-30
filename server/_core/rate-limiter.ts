/**
 * Rate Limiting Middleware - Security Protection
 * 
 * Prevents:
 * 1. Brute force attacks on sensitive endpoints
 * 2. DoS attacks on search/lookup endpoints
 * 3. Mass data extraction
 * 
 * Strategies:
 * - Per-user rate limits (authenticated requests)
 * - Per-IP rate limits (public endpoints)
 * - Per-endpoint custom limits
 */

import { TRPCError } from "@trpc/server";

// ============================================================================
// Types
// ============================================================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// ============================================================================
// In-Memory Store (Development)
// ============================================================================

class InMemoryStore {
  private store: RateLimitStore = {};
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  increment(key: string, windowMs: number): number {
    const now = Date.now();
    const entry = this.store[key];

    if (!entry || entry.resetTime < now) {
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return 1;
    }

    this.store[key].count++;
    return this.store[key].count;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// ============================================================================
// Rate Limiter Class
// ============================================================================

export class RateLimiter {
  private store: InMemoryStore;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
    this.store = new InMemoryStore();
  }

  /**
   * Check rate limit for a key (user ID, IP, etc)
   */
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const count = this.store.increment(key, this.config.windowMs);
    const resetTime = Date.now() + this.config.windowMs;
    const remaining = Math.max(0, this.config.maxRequests - count);

    return {
      allowed: count <= this.config.maxRequests,
      remaining,
      resetTime,
    };
  }

  /**
   * Throw TRPC error if rate limit exceeded
   */
  checkOrThrow(key: string): void {
    const result = this.check(key);
    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: this.config.message || "Too many requests. Please try again later.",
      });
    }
  }

  destroy(): void {
    this.store.destroy();
  }
}

// ============================================================================
// Predefined Rate Limiters
// ============================================================================

/**
 * Search/Lookup endpoints (CPF search, student search, etc)
 * 100 requests per minute per user
 */
export const searchRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "Too many search requests. Please wait before searching again.",
});

/**
 * Sensitive data access (CPF decryption, personal info)
 * 30 requests per minute per user
 */
export const sensitiveDataRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: "Too many sensitive data requests. Please wait before trying again.",
});

/**
 * Authentication attempts (login, password reset)
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many authentication attempts. Please try again later.",
});

/**
 * Export/Download endpoints
 * 10 requests per hour per user
 */
export const exportRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: "Too many export requests. Please wait before exporting again.",
});

/**
 * API write operations (create, update, delete)
 * 100 requests per minute per user
 */
export const writeRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "Too many write requests. Please wait before making changes.",
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get rate limit key from user ID or IP
 */
export function getRateLimitKey(userId?: number, ip?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ip) {
    return `ip:${ip}`;
  }
  return "anonymous";
}

/**
 * Extract client IP from request
 */
export function getClientIP(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// ============================================================================
// Middleware Factory
// ============================================================================

/**
 * Create rate limit middleware for tRPC
 */
export function createRateLimitMiddleware(limiter: RateLimiter, keyFn: (ctx: any) => string) {
  return async (opts: any) => {
    const key = keyFn(opts.ctx);
    limiter.checkOrThrow(key);
    return opts.next();
  };
}

// ============================================================================
// Cleanup
// ============================================================================

// Cleanup on process exit
process.on("exit", () => {
  searchRateLimiter.destroy();
  sensitiveDataRateLimiter.destroy();
  authRateLimiter.destroy();
  exportRateLimiter.destroy();
  writeRateLimiter.destroy();
});
