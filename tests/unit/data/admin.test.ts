import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

type Prisma = typeof import("@/lib/prisma").default;
let prisma: Prisma;
let getAdminOverview: typeof import("@/lib/data/admin").getAdminOverview;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ getAdminOverview } = await import("@/lib/data/admin"));
});

describe("admin overview data", () => {
    it("counts organizers, teams, and banned accounts with the correct filters", async () => {
        const calls: unknown[] = [];
        const original = prisma.user.count;
        prisma.user.count = (async (args: unknown) => {
            calls.push(args);
            return calls.length;
        }) as typeof prisma.user.count;
        try {
            assert.deepEqual(await getAdminOverview(), { organizerCount: 1, teamCount: 2, bannedAccountCount: 3 });
            assert.deepEqual(calls, [
                { where: { role: "organizer" } },
                { where: { role: "team" } },
                { where: { banned: true } },
            ]);
        } finally {
            prisma.user.count = original;
        }
    });
});
