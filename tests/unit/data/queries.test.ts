import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let teams: typeof import("@/lib/data/teams");
let registrations: typeof import("@/lib/data/registrations");
let announcements: typeof import("@/lib/data/announcements");

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    teams = await import("@/lib/data/teams");
    registrations = await import("@/lib/data/registrations");
    announcements = await import("@/lib/data/announcements");
});

describe("data query boundaries", () => {
    it("lists only approved teams and applies pagination and ban filters", async () => {
        const originalCount = prisma.team.count;
        const originalFind = prisma.team.findMany;
        let countArgs: unknown;
        let findArgs!: {
            where: { registration: { status: string }; user: { banned: boolean } };
            skip: number;
            take: number;
            orderBy: unknown;
        };
        try {
            prisma.team.count = (async (args: unknown) => {
                countArgs = args;
                return 5;
            }) as typeof prisma.team.count;
            prisma.team.findMany = (async (args: unknown) => {
                findArgs = args as typeof findArgs;
                return [];
            }) as unknown as typeof prisma.team.findMany;
            const result = await teams.listTeams({ page: 2, pageSize: 2, status: "BANNED" });
            assert.equal(result.meta.hasNextPage, true);
            assert.deepEqual(countArgs, { where: findArgs.where });
            assert.equal(findArgs.where.registration.status, "APPROVED");
            assert.equal(findArgs.where.user.banned, true);
            assert.equal(findArgs.skip, 2);
            assert.equal(findArgs.take, 2);
            assert.deepEqual(findArgs.orderBy, { createdAt: "desc" });
        } finally {
            prisma.team.count = originalCount;
            prisma.team.findMany = originalFind;
        }
    });

    it("prevents non-approved team detail reads", async () => {
        const originalFind = prisma.team.findFirst;
        let args!: { where: unknown };
        try {
            prisma.team.findFirst = (async (input: unknown) => {
                args = input as typeof args;
                return null;
            }) as unknown as typeof prisma.team.findFirst;
            assert.equal(await teams.getTeamDetail("team-1"), null);
            assert.deepEqual(args.where, { id: "team-1", registration: { status: "APPROVED" } });
        } finally {
            prisma.team.findFirst = originalFind;
        }
    });

    it("applies registration status, newest-first sorting, and pagination", async () => {
        const originalCount = prisma.registration.count;
        const originalFind = prisma.registration.findMany;
        let findArgs!: { where: unknown; orderBy: unknown; skip: number };
        try {
            prisma.registration.count = (async () => 3) as typeof prisma.registration.count;
            prisma.registration.findMany = (async (input: unknown) => {
                findArgs = input as typeof findArgs;
                return [];
            }) as unknown as typeof prisma.registration.findMany;
            const result = await registrations.listRegistrations({ page: 2, pageSize: 1, status: "PENDING" });
            assert.deepEqual(findArgs.where, { status: "PENDING" });
            assert.deepEqual(findArgs.orderBy, { createdAt: "desc" });
            assert.equal(findArgs.skip, 1);
            assert.equal(result.meta.hasNextPage, true);
        } finally {
            prisma.registration.count = originalCount;
            prisma.registration.findMany = originalFind;
        }
    });

    it("restricts public announcements and searches title or content case-insensitively", async () => {
        const originalFind = prisma.announcement.findMany;
        const originalCount = prisma.announcement.count;
        const originalTransaction = prisma.$transaction;
        let findArgs!: { where: { status: string; OR: unknown }; orderBy: unknown };
        try {
            prisma.announcement.findMany = (async (input: unknown) => {
                findArgs = input as typeof findArgs;
                return [];
            }) as unknown as typeof prisma.announcement.findMany;
            prisma.announcement.count = (async () => 0) as typeof prisma.announcement.count;
            prisma.$transaction = (async (promises: Promise<unknown>[]) =>
                Promise.all(promises)) as typeof prisma.$transaction;
            await announcements.listPublicAnnouncements({ page: 1, pageSize: 10, search: "  launch  " });
            assert.equal(findArgs.where.status, "PUBLISHED");
            assert.deepEqual(findArgs.where.OR, [
                { title: { contains: "launch", mode: "insensitive" } },
                { content: { contains: "launch", mode: "insensitive" } },
            ]);
            assert.deepEqual(findArgs.orderBy, [{ publishedAt: "desc" }, { createdAt: "desc" }]);
        } finally {
            prisma.announcement.findMany = originalFind;
            prisma.announcement.count = originalCount;
            prisma.$transaction = originalTransaction;
        }
    });
});
