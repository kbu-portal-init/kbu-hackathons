import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

type Prisma = typeof import("@/lib/prisma").default;
let prisma: Prisma;
let banAccount: typeof import("@/lib/services/account-banning").banAccount;
let unbanAccount: typeof import("@/lib/services/account-banning").unbanAccount;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ banAccount, unbanAccount } = await import("@/lib/services/account-banning"));
});

function user(role: string) {
    return { id: "user-1", role, email: "user@example.com", team: { members: [] } };
}

describe("account banning service guards", () => {
    it("rejects missing and unauthorized targets before mutation", async () => {
        const originalFind = prisma.user.findUnique;
        let calls = 0;
        prisma.user.findUnique = (async () => {
            calls++;
            return null;
        }) as unknown as typeof prisma.user.findUnique;
        try {
            assert.deepEqual(await banAccount({ userId: "user-1", reason: "reason" }, "admin", "admin-1"), {
                ok: false,
                error: { code: "ACCOUNT_NOT_BANNABLE", message: "This account cannot be banned" },
            });
            assert.deepEqual(await unbanAccount({ userId: "user-1" }, "admin", "admin-1"), {
                ok: false,
                error: { code: "ACCOUNT_NOT_MANAGEABLE", message: "This account cannot be managed" },
            });
            assert.equal(calls, 2);
        } finally {
            prisma.user.findUnique = originalFind;
        }
    });
    it("rejects admins and organizer attempts to manage non-team accounts", async () => {
        const originalFind = prisma.user.findUnique;
        prisma.user.findUnique = (async ({ where }: { where: { id: string } }) =>
            user(where.id === "admin" ? "admin" : "organizer")) as unknown as typeof prisma.user.findUnique;
        try {
            assert.equal((await banAccount({ userId: "admin", reason: "reason" }, "admin", "admin-1")).ok, false);
            assert.equal((await banAccount({ userId: "organizer", reason: "reason" }, "organizer", "org-1")).ok, false);
            assert.equal((await unbanAccount({ userId: "admin" }, "admin", "admin-1")).ok, false);
        } finally {
            prisma.user.findUnique = originalFind;
        }
    });
});
