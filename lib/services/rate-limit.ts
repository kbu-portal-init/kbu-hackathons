import "server-only";

import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isProduction = process.env.NODE_ENV === "production";
const isProductionRuntime = isProduction && process.env.NEXT_PHASE !== "phase-production-build";
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedisConfig = Boolean(redisUrl && redisToken);

if (isProductionRuntime && !hasRedisConfig) throw new Error("Upstash Redis configuration is required in production");

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const registrationByIp = redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "kbu:registration:ip" })
    : null;
const verificationByMember = redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m"), prefix: "kbu:verification:member" })
    : null;
const passwordResetByIp = redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "kbu:password-reset:ip" })
    : null;
const passwordResetByIdentifier = redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m"), prefix: "kbu:password-reset:identifier" })
    : null;

export type RateLimitResult = { success: true } | { success: false; retryAfterSeconds: number };

function hash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

function clientIp(headers?: Headers): string {
    return (
        headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers?.get("x-real-ip") ||
        headers?.get("cf-connecting-ip") ||
        "unknown"
    );
}

async function check(limiter: Ratelimit | null, identifier: string) {
    if (!limiter) return { success: true, retryAfter: 0 };
    try {
        const result = await limiter.limit(identifier);
        return { success: result.success, retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
    } catch (error) {
        if (isProductionRuntime) return { success: false, retryAfter: 60 };
        console.warn("Upstash rate limiting is unavailable in development", error);
        return { success: true, retryAfter: 0 };
    }
}

export async function checkRegistrationRateLimit(headers?: Headers): Promise<RateLimitResult> {
    const result = await check(registrationByIp, clientIp(headers));
    return result.success ? { success: true } : { success: false, retryAfterSeconds: result.retryAfter };
}

export async function checkVerificationRateLimit(memberId: string, email: string): Promise<RateLimitResult> {
    const result = await check(verificationByMember, `${memberId}:${hash(email.trim().toLowerCase())}`);
    return result.success ? { success: true } : { success: false, retryAfterSeconds: result.retryAfter };
}

export async function checkPasswordResetRateLimit(identifier: string, request?: Request): Promise<RateLimitResult> {
    const [ipResult, identifierResult] = await Promise.all([
        check(passwordResetByIp, clientIp(request?.headers)),
        check(passwordResetByIdentifier, hash(identifier.trim().toLowerCase())),
    ]);
    return ipResult.success && identifierResult.success
        ? { success: true }
        : { success: false, retryAfterSeconds: Math.max(ipResult.retryAfter, identifierResult.retryAfter) };
}

export const upstashSecondaryStorage = redis
    ? {
          get: (key: string) => redis.get(key),
          getAndDelete: (key: string) => redis.getdel(key),
          increment: async (key: string, ttl: number) => {
              const count = await redis.incr(key);
              if (count === 1) await redis.expire(key, ttl);
              return count;
          },
          set: (key: string, value: string, ttl?: number) =>
              ttl ? redis.set(key, value, { ex: ttl }) : redis.set(key, value),
          delete: async (key: string) => {
              await redis.del(key);
          },
      }
    : undefined;
