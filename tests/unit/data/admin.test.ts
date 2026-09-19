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
    it("counts every overview metric with the correct filters", async () => {
        const calls: unknown[] = [];
        const models = [
            prisma.user,
            prisma.teamMember,
            prisma.registration,
            prisma.submission,
            prisma.auditLog,
            prisma.announcement,
            prisma.studentEmailVerification,
        ];
        const originals = models.map((model) => model.count);
        let value = 0;

        for (const model of models) {
            model.count = (async (args?: unknown) => {
                calls.push(args);
                return ++value;
            }) as unknown as typeof model.count;
        }

        try {
            assert.deepEqual(await getAdminOverview(), {
                organizerCount: 1,
                teamCount: 2,
                bannedAccountCount: 3,
                teamMemberCount: 4,
                registrationCount: 5,
                pendingRegistrationCount: 6,
                approvedRegistrationCount: 7,
                rejectedRegistrationCount: 8,
                submissionCount: 9,
                auditLogCount: 10,
                announcementCount: 11,
                pendingVerificationCount: 12,
            });
            assert.deepEqual(calls, [
                { where: { role: "organizer" } },
                { where: { role: "team" } },
                { where: { banned: true } },
                undefined,
                undefined,
                { where: { status: "PENDING" } },
                { where: { status: "APPROVED" } },
                { where: { status: "REJECTED" } },
                undefined,
                undefined,
                undefined,
                { where: { verifiedAt: null } },
            ]);
        } finally {
            models.forEach((model, index) => {
                model.count = originals[index];
            });
        }
    });
});
