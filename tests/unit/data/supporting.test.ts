import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let deleteAuditLog: typeof import("@/lib/services/audits").deleteAuditLog;
let audits: typeof import("@/lib/data/audits");
let organizers: typeof import("@/lib/data/organizers");
let eventSettings: typeof import("@/lib/data/event-settings");
let adminProfile: typeof import("@/lib/data/admin-profile");
let teamMembers: typeof import("@/lib/data/team-members");
let publicCards: typeof import("@/lib/data/public-member-cards");

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ deleteAuditLog } = await import("@/lib/services/audits"));
    audits = await import("@/lib/data/audits");
    organizers = await import("@/lib/data/organizers");
    eventSettings = await import("@/lib/data/event-settings");
    adminProfile = await import("@/lib/data/admin-profile");
    teamMembers = await import("@/lib/data/team-members");
    publicCards = await import("@/lib/data/public-member-cards");
});

describe("supporting backend modules", () => {
    it("reports whether an audit record was deleted", async () => {
        const originalDelete = prisma.auditLog.deleteMany;
        try {
            prisma.auditLog.deleteMany = (async () => ({ count: 0 })) as typeof prisma.auditLog.deleteMany;
            let result = await deleteAuditLog({ id: "audit-1" });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "AUDIT_LOG_NOT_FOUND");
            prisma.auditLog.deleteMany = (async () => ({ count: 1 })) as typeof prisma.auditLog.deleteMany;
            result = await deleteAuditLog({ id: "audit-1" });
            assert.deepEqual(result, { ok: true, data: { id: "audit-1" } });
        } finally {
            prisma.auditLog.deleteMany = originalDelete;
        }
    });

    it("maps audit user filters to actor and member filters to target", async () => {
        const originalCount = prisma.auditLog.count;
        const originalFind = prisma.auditLog.findMany;
        let where: unknown;
        try {
            prisma.auditLog.count = (async (input: { where: unknown }) => {
                where = input.where;
                return 0;
            }) as typeof prisma.auditLog.count;
            prisma.auditLog.findMany = (async () => []) as unknown as typeof prisma.auditLog.findMany;
            await audits.listAuditLogs({
                page: 1,
                pageSize: 20,
                userId: "user-1",
                userKind: "user",
                action: "EMAIL_SENT",
            });
            assert.deepEqual(where, { actorId: "user-1", action: "EMAIL_SENT" });
            await audits.listAuditLogs({ page: 1, pageSize: 20, userId: "member-1", userKind: "teamMember" });
            assert.deepEqual(where, { targetId: "member-1" });
        } finally {
            prisma.auditLog.count = originalCount;
            prisma.auditLog.findMany = originalFind;
        }
    });

    it("restricts organizer and admin profile lookups by role", async () => {
        const originalFirst = prisma.user.findFirst;
        const calls: unknown[] = [];
        try {
            prisma.user.findFirst = (async (input: unknown) => {
                calls.push(input);
                return null;
            }) as unknown as typeof prisma.user.findFirst;
            assert.equal(await organizers.getOrganizer("organizer-1"), null);
            assert.equal(await adminProfile.getAdminProfile("admin-1"), null);
            assert.deepEqual((calls[0] as { where: unknown }).where, { id: "organizer-1", role: "organizer" });
            assert.deepEqual((calls[1] as { where: unknown }).where, { id: "admin-1", role: "admin" });
        } finally {
            prisma.user.findFirst = originalFirst;
        }
    });

    it("reads singleton event existence", async () => {
        const originalCount = prisma.eventSettings.count;
        try {
            prisma.eventSettings.count = (async () => 0) as typeof prisma.eventSettings.count;
            assert.equal(await eventSettings.existsEventSettings(), false);
            prisma.eventSettings.count = (async () => 1) as typeof prisma.eventSettings.count;
            assert.equal(await eventSettings.existsEventSettings(), true);
        } finally {
            prisma.eventSettings.count = originalCount;
        }
    });

    it("returns approval dates and public card URLs with null fallbacks", async () => {
        const originalReview = prisma.registrationReview.findFirst;
        const originalCard = prisma.teamMember.findUnique;
        try {
            prisma.registrationReview.findFirst = (async () =>
                null) as unknown as typeof prisma.registrationReview.findFirst;
            assert.equal(await teamMembers.getTeamApprovalDate("team-1"), null);
            prisma.registrationReview.findFirst = (async () => ({
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
            })) as unknown as typeof prisma.registrationReview.findFirst;
            assert.equal(await teamMembers.getTeamApprovalDate("team-1"), "2026-01-01T00:00:00.000Z");
            prisma.teamMember.findUnique = (async () => null) as unknown as typeof prisma.teamMember.findUnique;
            assert.equal(await publicCards.getPublicMemberCard("token"), null);
            prisma.teamMember.findUnique = (async () => ({
                cardUrl: "https://media.example.test/card.png",
            })) as unknown as typeof prisma.teamMember.findUnique;
            assert.equal(await publicCards.getPublicMemberCard("token"), "https://media.example.test/card.png");
        } finally {
            prisma.registrationReview.findFirst = originalReview;
            prisma.teamMember.findUnique = originalCard;
        }
    });
});
