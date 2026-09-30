import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { before, beforeEach, describe, it } from "node:test";

type LimitResult = { success: boolean; reset: number };
type FakeLimiter = { identifiers: string[]; result?: LimitResult; error?: Error };

const limiters = new Map<string, FakeLimiter>();

class FakeRatelimit {
    static slidingWindow(limit: number, window: string) {
        return { limit, window };
    }

    readonly state: FakeLimiter;

    constructor(input: { prefix: string }) {
        this.state = { identifiers: [] };
        limiters.set(input.prefix, this.state);
    }

    async limit(identifier: string) {
        this.state.identifiers.push(identifier);
        if (this.state.error) throw this.state.error;
        return this.state.result ?? { success: true, reset: Date.now() };
    }
}

class FakeRedis {}

process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

const ratelimitPath = require.resolve("@upstash/ratelimit");
require.cache[ratelimitPath] = {
    id: ratelimitPath,
    filename: ratelimitPath,
    loaded: true,
    exports: { Ratelimit: FakeRatelimit },
} as NodeJS.Module;

const redisPath = require.resolve("@upstash/redis");
require.cache[redisPath] = {
    id: redisPath,
    filename: redisPath,
    loaded: true,
    exports: { Redis: FakeRedis },
} as NodeJS.Module;

let rateLimit: typeof import("@/lib/services/rate-limit");

before(async () => {
    rateLimit = await import("@/lib/services/rate-limit");
});

beforeEach(() => {
    for (const limiter of limiters.values()) {
        limiter.identifiers = [];
        limiter.result = undefined;
        limiter.error = undefined;
    }
});

describe("rate limiting", () => {
    it("uses the first forwarded IP for registration requests", async () => {
        const headers = new Headers({ "x-forwarded-for": " 203.0.113.7, 10.0.0.1" });
        assert.deepEqual(await rateLimit.checkRegistrationRateLimit(headers), { success: true });
        assert.deepEqual(limiters.get("kbu:registration:ip")?.identifiers, ["203.0.113.7"]);
    });

    it("prioritizes the Cloudflare client IP over other headers", async () => {
        const headers = new Headers({
            "cf-connecting-ip": "198.51.100.4",
            "x-real-ip": "192.0.2.10",
            "x-forwarded-for": "203.0.113.7, 10.0.0.1",
        });
        await rateLimit.checkRegistrationRateLimit(headers);
        assert.deepEqual(limiters.get("kbu:registration:ip")?.identifiers, ["198.51.100.4"]);
    });

    it("falls back to the Nginx client IP when Cloudflare is unavailable", async () => {
        const headers = new Headers({
            "x-real-ip": "192.0.2.10",
            "x-forwarded-for": "203.0.113.7, 10.0.0.1",
        });
        await rateLimit.checkRegistrationRateLimit(headers);
        assert.deepEqual(limiters.get("kbu:registration:ip")?.identifiers, ["192.0.2.10"]);
    });

    it("normalizes and hashes verification identifiers", async () => {
        await rateLimit.checkVerificationRateLimit("member-1", " Student@Example.COM ");
        const hash = createHash("sha256").update("student@example.com").digest("hex");
        assert.deepEqual(limiters.get("kbu:verification:member")?.identifiers, [`member-1:${hash}`]);
    });

    it("checks both IP and normalized identifier for password resets", async () => {
        const request = new Request("https://example.test", {
            headers: { "cf-connecting-ip": "198.51.100.4" },
        });
        await rateLimit.checkPasswordResetRateLimit(" Team-One ", request);
        const hash = createHash("sha256").update("team-one").digest("hex");
        assert.deepEqual(limiters.get("kbu:password-reset:ip")?.identifiers, ["198.51.100.4"]);
        assert.deepEqual(limiters.get("kbu:password-reset:identifier")?.identifiers, [hash]);
    });

    it("returns the longest retry period when either password-reset limit fails", async () => {
        const now = Date.now();
        const ip = limiters.get("kbu:password-reset:ip");
        const identifier = limiters.get("kbu:password-reset:identifier");
        assert.ok(ip && identifier);
        ip.result = { success: false, reset: now + 2_000 };
        identifier.result = { success: false, reset: now + 9_000 };

        const result = await rateLimit.checkPasswordResetRateLimit("team-one");
        assert.equal(result.success, false);
        if (!result.success) assert.ok(result.retryAfterSeconds >= 8 && result.retryAfterSeconds <= 9);
    });

    it("fails open when Redis is unavailable outside production", async () => {
        const limiter = limiters.get("kbu:registration:ip");
        assert.ok(limiter);
        limiter.error = new Error("redis unavailable");
        const originalWarn = console.warn;
        console.warn = () => {};
        try {
            assert.deepEqual(await rateLimit.checkRegistrationRateLimit(), { success: true });
        } finally {
            console.warn = originalWarn;
        }
    });
});
