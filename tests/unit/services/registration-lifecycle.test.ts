import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

type RegistrationRecord = ReturnType<typeof pendingRecord> | null;
let registrationRecord: RegistrationRecord;
let verified = true;
let notificationFails = false;
let verificationFails = false;
const notifications: unknown[] = [];

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

function mock(path: string, exports: object) {
    const filename = require.resolve(path);
    require.cache[filename] = { id: filename, filename, loaded: true, exports } as NodeJS.Module;
}

mock("next/headers", { headers: async () => new Headers() });
mock("../../../lib/auth/config", { auth: { api: { signUpEmail: async () => {} } } });
mock("../../../lib/data/registrations", {
    countApprovedTeams: async () => 0,
    getRegistrationWithTeam: async () => registrationRecord,
    getRegistrationByTeamId: async () => registrationRecord,
});
mock("../../../lib/services/rate-limit", { checkRegistrationRateLimit: async () => ({ success: true }) });
mock("../../../lib/services/password-reset", {
    createPasswordSetupUrl: async () => "https://example.test/setup",
});
mock("../../../lib/services/notifications", {
    sendTeamRegistrationNotification: async (input: unknown) => {
        if (notificationFails) throw new Error("delivery failed");
        notifications.push(input);
    },
});
mock("../../../lib/services/student-email-verification", {
    allMembersVerified: async () => verified,
    consumeStudentEmailVerification: async () => ({
        ok: true,
        data: { teamMemberId: "member-1", alreadyVerified: false },
    }),
    sendStudentEmailVerification: async () => {
        if (verificationFails) throw new Error("delivery failed");
    },
});

let prisma: typeof import("@/lib/prisma").default;
let service: typeof import("@/lib/services/registration");

const pendingRecord = () => ({
    id: "registration-1",
    teamId: "team-1",
    status: "PENDING",
    team: {
        displayName: "Build Team",
        loginName: "build-team",
        members: [{ id: "leader-1", name: "Leader", studentEmail: "leader@example.com", role: "LEADER" }],
    },
});

before(async () => {
    ({ default: prisma } = await import("@/lib/prisma"));
    service = await import("@/lib/services/registration");
});

beforeEach(() => {
    registrationRecord = pendingRecord();
    verified = true;
    notificationFails = false;
    verificationFails = false;
    notifications.length = 0;
});

describe("registration lifecycle", () => {
    it("creates a pending team and reports partial verification delivery", async () => {
        const originalEvent = prisma.eventSettings.findUnique;
        const originalTeamFind = prisma.team.findUnique;
        const originalTransaction = prisma.$transaction;
        try {
            prisma.eventSettings.findUnique = (async () => ({
                registrationOpensAt: new Date("2020-01-01"),
                registrationClosesAt: new Date("2099-01-01"),
                minTeamSize: 2,
                maxTeamSize: 4,
                maxTeams: 10,
            })) as unknown as typeof prisma.eventSettings.findUnique;
            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    team: { create: async () => ({ id: "team-1", displayName: "Build Team" }) },
                    teamMember: {
                        create: async ({ data }: { data: { role: string } }) => ({
                            id: data.role === "LEADER" ? "leader-1" : "member-1",
                        }),
                    },
                    registration: { create: async () => ({ id: "registration-1" }) },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;
            verificationFails = true;
            const result = await service.submitRegistration({
                teamName: "Build Team",
                leaderName: "Leader",
                leaderEmail: "leader@example.com",
                leaderRole: "LEADER",
                members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" }],
            });
            assert.deepEqual(result, {
                ok: true,
                data: { registrationId: "registration-1", teamName: "Build Team", verificationEmailsSent: false },
            });
        } finally {
            prisma.eventSettings.findUnique = originalEvent;
            prisma.team.findUnique = originalTeamFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("maps duplicate student emails to a stable error", async () => {
        const originalEvent = prisma.eventSettings.findUnique;
        const originalTeamFind = prisma.team.findUnique;
        const originalTransaction = prisma.$transaction;
        try {
            prisma.eventSettings.findUnique = (async () => ({
                registrationOpensAt: new Date("2020-01-01"),
                registrationClosesAt: new Date("2099-01-01"),
                minTeamSize: 2,
                maxTeamSize: 4,
                maxTeams: 10,
            })) as unknown as typeof prisma.eventSettings.findUnique;
            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;
            prisma.$transaction = (async () => {
                throw { code: "P2002", meta: { target: ["student_email"] } };
            }) as typeof prisma.$transaction;
            const result = await service.submitRegistration({
                teamName: "Build Team",
                leaderName: "Leader",
                leaderEmail: "leader@example.com",
                leaderRole: "LEADER",
                members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" }],
            });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "EMAIL_EXISTS");
        } finally {
            prisma.eventSettings.findUnique = originalEvent;
            prisma.team.findUnique = originalTeamFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects missing, non-pending, unverified, and leaderless approvals", async () => {
        registrationRecord = null;
        let result = await service.approveRegistration({ registrationId: "registration-1" }, "admin-1");
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "REGISTRATION_NOT_FOUND");

        registrationRecord = { ...pendingRecord(), status: "APPROVED" };
        result = await service.approveRegistration({ registrationId: "registration-1" }, "admin-1");
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "INVALID_STATUS");

        registrationRecord = pendingRecord();
        verified = false;
        result = await service.approveRegistration({ registrationId: "registration-1" }, "admin-1");
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "EMAIL_VERIFICATION_PENDING");

        verified = true;
        registrationRecord = { ...pendingRecord(), team: { ...pendingRecord().team, members: [] } };
        result = await service.approveRegistration({ registrationId: "registration-1" }, "admin-1");
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "TEAM_LEADER_NOT_FOUND");
    });

    it("approves atomically, links the user, and tolerates setup delivery failure", async () => {
        const originalTeamFind = prisma.team.findUnique;
        const originalUserFind = prisma.user.findUnique;
        const originalUserUpdate = prisma.user.update;
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];
        try {
            prisma.team.findUnique = (async () => ({ userId: "user-1" })) as unknown as typeof prisma.team.findUnique;
            prisma.user.findUnique = (async () => null) as unknown as typeof prisma.user.findUnique;
            prisma.user.update = (async () => ({ id: "user-1" })) as unknown as typeof prisma.user.update;
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    eventSettings: { findUnique: async () => ({ maxTeams: 10 }) },
                    registration: {
                        count: async () => 1,
                        updateMany: async () => {
                            operations.push("approve");
                            return { count: 1 };
                        },
                    },
                    team: { update: async () => operations.push("link") },
                    registrationReview: { create: async () => operations.push("review") },
                    auditLog: { create: async () => operations.push("audit") },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;
            notificationFails = true;
            const result = await service.approveRegistration({ registrationId: "registration-1" }, "admin-1");
            assert.equal(result.ok, true);
            if (result.ok) assert.equal(result.data.passwordSetupSent, false);
            assert.deepEqual(operations, ["lock", "approve", "link", "review", "audit"]);
        } finally {
            prisma.team.findUnique = originalTeamFind;
            prisma.user.findUnique = originalUserFind;
            prisma.user.update = originalUserUpdate;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects registrations atomically and ignores notification failures", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];
        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    registration: { update: async () => operations.push("registration") },
                    registrationReview: { create: async () => operations.push("review") },
                    auditLog: { create: async () => operations.push("audit") },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;
            notificationFails = true;
            const result = await service.rejectRegistration(
                { registrationId: "registration-1", reason: "Incomplete" },
                "admin-1",
            );
            assert.deepEqual(result, { ok: true, data: { registrationId: "registration-1" } });
            assert.deepEqual(operations, ["registration", "review", "audit"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });
});
