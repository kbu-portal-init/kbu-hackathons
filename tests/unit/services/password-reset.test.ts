import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let createPasswordResetUrl: typeof import("@/lib/services/password-reset").createPasswordResetUrl;
let createPasswordSetupUrl: typeof import("@/lib/services/password-reset").createPasswordSetupUrl;
type CreatedVerification = { identifier: string; expiresAt: Date; value: string };

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ createPasswordResetUrl, createPasswordSetupUrl } = await import("@/lib/services/password-reset"));
});

describe("password reset token creation", () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

    after(() => {
        if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
        else process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    });

    it("stores the raw token in Better Auth's reset identifier and uses a one-hour expiry", async () => {
        const originalTransaction = prisma.$transaction;
        process.env.NEXT_PUBLIC_APP_URL = "https://example.test/";
        let created: CreatedVerification | undefined;
        let deleted = false;
        prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
            callback({
                verification: {
                    deleteMany: async () => {
                        deleted = true;
                        return { count: 1 };
                    },
                    create: async ({ data }: { data: CreatedVerification & { id: string } }) => {
                        created = { identifier: data.identifier, expiresAt: data.expiresAt, value: data.value };
                        return data;
                    },
                },
            } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

        const before = Date.now();
        const url = await createPasswordResetUrl("user-1");
        const token = new URL(url).searchParams.get("token");
        assert.ok(token);
        assert.equal(url, `https://example.test/reset-password?token=${encodeURIComponent(token)}`);
        assert.equal(created?.identifier, `reset-password:${token}`);
        assert.equal(created?.value, "user-1");
        assert.equal(deleted, true);
        assert.ok(created && created.expiresAt.getTime() >= before + 3599 * 1000);
        assert.ok(created && created.expiresAt.getTime() <= Date.now() + 3601 * 1000);
        prisma.$transaction = originalTransaction;
    });

    it("uses a seven-day expiry for setup links", async () => {
        const originalTransaction = prisma.$transaction;
        let expiresAt: Date | undefined;
        prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
            callback({
                verification: {
                    deleteMany: async () => ({ count: 0 }),
                    create: async ({ data }: { data: { expiresAt: Date } }) => {
                        expiresAt = data.expiresAt;
                        return data;
                    },
                },
            } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

        const before = Date.now();
        await createPasswordSetupUrl("user-1");
        assert.ok(expiresAt && expiresAt.getTime() >= before + 7 * 24 * 60 * 60 * 1000 - 1000);
        assert.ok(expiresAt && expiresAt.getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000);
        prisma.$transaction = originalTransaction;
    });
});
