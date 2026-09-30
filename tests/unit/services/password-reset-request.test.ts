import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let requestPasswordReset: typeof import("@/lib/services/password-reset-request").requestPasswordReset;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ requestPasswordReset } = await import("@/lib/services/password-reset-request"));
});

describe("password reset request eligibility", () => {
    it("rejects unknown usernames without creating a reset token", async () => {
        const originalFindFirst = prisma.user.findFirst;
        let tokenWrites = 0;
        const originalTransaction = prisma.$transaction;
        prisma.user.findFirst = (async () => null) as typeof prisma.user.findFirst;
        prisma.$transaction = (async () => {
            tokenWrites++;
            return undefined;
        }) as unknown as typeof prisma.$transaction;
        try {
            assert.deepEqual(await requestPasswordReset({ username: "missing-team" }), {
                sent: false,
                found: false,
                blocked: "UNKNOWN_IDENTIFIER",
            });
            assert.equal(tokenWrites, 0);
        } finally {
            prisma.user.findFirst = originalFindFirst;
            prisma.$transaction = originalTransaction;
        }
    });

    for (const status of ["PENDING", "REJECTED"] as const) {
        it(`rejects ${status.toLowerCase()} teams without creating a reset token`, async () => {
            const originalFindFirst = prisma.user.findFirst;
            const originalTransaction = prisma.$transaction;
            let tokenWrites = 0;
            prisma.user.findFirst = (async () => ({
                id: "team-user",
                email: "team@example.com",
                role: "team",
                team: { archivedAt: null, registration: { status }, members: [] },
            })) as unknown as typeof prisma.user.findFirst;
            prisma.$transaction = (async () => {
                tokenWrites++;
                return undefined;
            }) as unknown as typeof prisma.$transaction;
            try {
                assert.deepEqual(await requestPasswordReset({ username: "team-alpha" }), {
                    sent: false,
                    found: true,
                    blocked: "PENDING_TEAM",
                });
                assert.equal(tokenWrites, 0);
            } finally {
                prisma.user.findFirst = originalFindFirst;
                prisma.$transaction = originalTransaction;
            }
        });
    }

    it("rejects archived teams through the email path", async () => {
        const originalFindUnique = prisma.user.findUnique;
        const originalTransaction = prisma.$transaction;
        let tokenWrites = 0;
        prisma.user.findUnique = (async () => ({
            id: "team-user",
            email: "team@example.com",
            role: "team",
            team: { archivedAt: new Date(), registration: { status: "APPROVED" }, members: [] },
        })) as unknown as typeof prisma.user.findUnique;
        prisma.$transaction = (async () => {
            tokenWrites++;
            return undefined;
        }) as unknown as typeof prisma.$transaction;
        try {
            assert.deepEqual(await requestPasswordReset({ email: "team@example.com" }), {
                sent: false,
                found: true,
                blocked: "PENDING_TEAM",
            });
            assert.equal(tokenWrites, 0);
        } finally {
            prisma.user.findUnique = originalFindUnique;
            prisma.$transaction = originalTransaction;
        }
    });
});
