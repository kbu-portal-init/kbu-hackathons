import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

type RegistrationRecord = ReturnType<typeof pendingRecord> | null;
let registrationRecord: RegistrationRecord;
let verified = true;
let notificationFails = false;
let verificationFails = false;
const notifications: unknown[] = [];

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
let approvedTeamCount = 0;
let rateLimitCalls = 0;
const verificationRequests: string[] = [];

mock("next/headers", { headers: async () => new Headers() });
mock("@/lib/auth/config", { auth: { api: { signUpEmail: async () => {} } } });
mock("@/lib/data/registrations", {
    countApprovedTeams: async () => approvedTeamCount,
    getRegistrationWithTeam: async () => registrationRecord,
    getRegistrationByTeamId: async () => registrationRecord,
});

mock("@/lib/services/rate-limit", {
    checkRegistrationRateLimit: async () => {
        rateLimitCalls++;
        return { success: true };
    },
});
mock("@/lib/services/password-reset", {
    createPasswordSetupUrl: async () => "https://example.test/setup",
});
mock("@/lib/services/notifications", {
    sendTeamRegistrationNotification: async (input: unknown) => {
        if (notificationFails) throw new Error("delivery failed");
        notifications.push(input);
    },
});
mock("@/lib/services/student-email-verification", {
    allMembersVerified: async () => verified,
    consumeStudentEmailVerification: async () => ({
        ok: true,
        data: { teamMemberId: "member-1", alreadyVerified: false },
    }),
    sendStudentEmailVerification: async (memberId: string) => {
        verificationRequests.push(memberId);
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
        program: "THAI_PROGRAM",
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
    approvedTeamCount = 0;
    rateLimitCalls = 0;
    verificationRequests.length = 0;
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
                maxThaiTeams: 10,
                maxInternationalTeams: 10,
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
                program: "THAI_PROGRAM",
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
                maxThaiTeams: 10,
                maxInternationalTeams: 10,
            })) as unknown as typeof prisma.eventSettings.findUnique;
            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;
            prisma.$transaction = (async () => {
                throw {
                    code: "P2002",
                    message: "Unique constraint failed on the constraint: `team_member_student_email_key`",
                    meta: {
                        modelName: "TeamMember",
                        driverAdapterError: {
                            cause: {
                                kind: "UniqueConstraintViolation",
                                constraint: { index: "team_member_student_email_key" },
                                table: "team_member",
                            },
                        },
                    },
                };
            }) as typeof prisma.$transaction;
            const result = await service.submitRegistration({
                teamName: "Build Team",
                program: "THAI_PROGRAM",
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
                    eventSettings: {
                        findUnique: async () => ({ maxThaiTeams: 10, maxInternationalTeams: 10 }),
                    },
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

    it("creates a pending management registration with an audit entry and verification emails", async () => {
        const originalEvent = prisma.eventSettings.findUnique;
        const originalTeamFind = prisma.team.findUnique;
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];
        const memberIds: string[] = [];
        let registrationData: Record<string, unknown> | undefined;
        let auditData: Record<string, unknown> | undefined;

        try {
            prisma.eventSettings.findUnique = (async () => ({
                minTeamSize: 2,
                maxTeamSize: 4,
                maxThaiTeams: 10,
                maxInternationalTeams: 10,
            })) as unknown as typeof prisma.eventSettings.findUnique;

            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;

            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    team: {
                        create: async () => {
                            operations.push("team");
                            return { id: "team-1", displayName: "Build Team" };
                        },
                    },
                    teamMember: {
                        create: async ({ data }: { data: { role: string } }) => {
                            operations.push("member");
                            const id = data.role === "LEADER" ? "leader-1" : "member-1";
                            memberIds.push(id);
                            return { id };
                        },
                    },
                    registration: {
                        create: async ({ data }: { data: Record<string, unknown> }) => {
                            operations.push("registration");
                            registrationData = data;
                            return { id: "registration-1" };
                        },
                    },
                    auditLog: {
                        create: async ({ data }: { data: Record<string, unknown> }) => {
                            operations.push("audit");
                            auditData = data;
                        },
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            const result = await service.createManagementRegistration(
                {
                    teamName: "Build Team",
                    program: "THAI_PROGRAM",
                    leaderName: "Leader",
                    leaderEmail: "leader@example.com",
                    leaderRole: "LEADER",
                    members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" }],
                },
                "organizer-1",
            );

            assert.deepEqual(result, {
                ok: true,
                data: {
                    registrationId: "registration-1",
                    teamName: "Build Team",
                    verificationEmailsSent: true,
                },
            });

            assert.deepEqual(operations, ["team", "member", "member", "registration", "audit"]);
            assert.deepEqual(memberIds, ["leader-1", "member-1"]);
            assert.deepEqual(verificationRequests, ["leader-1", "member-1"]);
            assert.equal(rateLimitCalls, 0);

            assert.equal(registrationData?.applicationNotes, "Registered by Leader");
            assert.ok(registrationData?.submittedAt instanceof Date);
            assert.equal(registrationData?.status, undefined);

            assert.equal(auditData?.actorId, "organizer-1");
            assert.equal(auditData?.action, "REGISTRATION_CREATED");
            assert.equal(auditData?.targetType, "Registration");
            assert.equal(auditData?.targetId, "registration-1");
        } finally {
            prisma.eventSettings.findUnique = originalEvent;
            prisma.team.findUnique = originalTeamFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects management creation when team size is invalid or program quota is exhausted", async () => {
        const originalEvent = prisma.eventSettings.findUnique;
        const originalTransaction = prisma.$transaction;
        const settings = {
            minTeamSize: 2,
            maxTeamSize: 4,
            maxThaiTeams: 10,
            maxInternationalTeams: 5,
        };

        let transactionCalls = 0;

        try {
            prisma.eventSettings.findUnique = (async () =>
                settings) as unknown as typeof prisma.eventSettings.findUnique;
            prisma.$transaction = (async () => {
                transactionCalls++;
                throw new Error("Transaction should not run");
            }) as unknown as typeof prisma.$transaction;

            const input = {
                teamName: "Build Team",
                program: "THAI_PROGRAM" as const,
                leaderName: "Leader",
                leaderEmail: "leader@example.com",
                leaderRole: "LEADER" as const,
                members: [] as { name: string; email: string; role: "DESIGNER" }[],
            };

            const invalidSize = await service.createManagementRegistration(input, "organizer-1");

            assert.equal(invalidSize.ok, false);
            if (!invalidSize.ok) assert.equal(invalidSize.error.code, "INVALID_TEAM_SIZE");

            approvedTeamCount = 10;

            const quotaReached = await service.createManagementRegistration(
                {
                    ...input,
                    members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" }],
                },
                "organizer-1",
            );

            assert.equal(quotaReached.ok, false);
            if (!quotaReached.ok) assert.equal(quotaReached.error.code, "MAX_TEAMS_REACHED");

            assert.equal(transactionCalls, 0);
        } finally {
            prisma.eventSettings.findUnique = originalEvent;
            prisma.$transaction = originalTransaction;
        }
    });

    it("maps duplicate student emails to EMAIL_EXISTS for management creation", async () => {
        const originalEvent = prisma.eventSettings.findUnique;
        const originalTeamFind = prisma.team.findUnique;
        const originalTransaction = prisma.$transaction;

        try {
            prisma.eventSettings.findUnique = (async () => ({
                minTeamSize: 2,
                maxTeamSize: 4,
                maxThaiTeams: 10,
                maxInternationalTeams: 10,
            })) as unknown as typeof prisma.eventSettings.findUnique;

            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;

            prisma.$transaction = (async () => {
                throw {
                    code: "P2002",
                    message: "Unique constraint failed on the constraint: `team_member_student_email_key`",
                };
            }) as unknown as typeof prisma.$transaction;

            const result = await service.createManagementRegistration(
                {
                    teamName: "Build Team",
                    program: "THAI_PROGRAM",
                    leaderName: "Leader",
                    leaderEmail: "leader@example.com",
                    leaderRole: "LEADER",
                    members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" }],
                },
                "organizer-1",
            );

            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "EMAIL_EXISTS");
        } finally {
            prisma.eventSettings.findUnique = originalEvent;
            prisma.team.findUnique = originalTeamFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("keeps management registration creation successful when verification delivery fails", async () => {
        const originalEvent = prisma.eventSettings.findUnique;
        const originalTeamFind = prisma.team.findUnique;
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];

        try {
            prisma.eventSettings.findUnique = (async () => ({
                minTeamSize: 2,
                maxTeamSize: 4,
                maxThaiTeams: 10,
                maxInternationalTeams: 10,
            })) as unknown as typeof prisma.eventSettings.findUnique;

            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;

            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    team: {
                        create: async () => ({ id: "team-1", displayName: "Build Team" }),
                    },
                    teamMember: {
                        create: async ({ data }: { data: { role: string } }) => ({
                            id: data.role === "LEADER" ? "leader-1" : "member-1",
                        }),
                    },
                    registration: {
                        create: async () => {
                            operations.push("registration");
                            return { id: "registration-1" };
                        },
                    },
                    auditLog: {
                        create: async () => operations.push("audit"),
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            verificationFails = true;

            const result = await service.createManagementRegistration(
                {
                    teamName: "Build Team",
                    program: "THAI_PROGRAM",
                    leaderName: "Leader",
                    leaderEmail: "leader@example.com",
                    leaderRole: "LEADER",
                    members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" }],
                },
                "organizer-1",
            );

            assert.deepEqual(result, {
                ok: true,
                data: {
                    registrationId: "registration-1",
                    teamName: "Build Team",
                    verificationEmailsSent: false,
                },
            });

            assert.deepEqual(operations, ["registration", "audit"]);
            assert.deepEqual(verificationRequests, ["leader-1", "member-1"]);
        } finally {
            prisma.eventSettings.findUnique = originalEvent;
            prisma.team.findUnique = originalTeamFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("updates registration notes and writes an audit entry atomically", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];
        let auditData: Record<string, unknown> | undefined;
        let updateData: Record<string, unknown> | undefined;

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    registration: {
                        findUnique: async () => {
                            operations.push("find");
                            return {
                                id: "registration-1",
                                applicationNotes: "Old notes",
                            };
                        },
                        update: async ({ data }: { data: Record<string, unknown> }) => {
                            operations.push("update");
                            updateData = data;
                        },
                    },
                    auditLog: {
                        create: async ({ data }: { data: Record<string, unknown> }) => {
                            operations.push("audit");
                            auditData = data;
                        },
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            const result = await service.updateRegistration(
                {
                    registrationId: "registration-1",
                    applicationNotes: "Updated notes",
                },
                "organizer-1",
            );

            assert.deepEqual(result, {
                ok: true,
                data: { registrationId: "registration-1" },
            });

            assert.deepEqual(updateData, {
                applicationNotes: "Updated notes",
            });

            assert.equal(auditData?.actorId, "organizer-1");
            assert.equal(auditData?.action, "REGISTRATION_UPDATED");
            assert.equal(auditData?.targetType, "Registration");
            assert.equal(auditData?.targetId, "registration-1");

            assert.deepEqual(auditData?.details, {
                previousApplicationNotes: "Old notes",
                applicationNotes: "Updated notes",
            });

            assert.deepEqual(operations, ["lock", "find", "update", "audit"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("returns REGISTRATION_NOT_FOUND without updating or auditing", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    registration: {
                        findUnique: async () => {
                            operations.push("find");
                            return null;
                        },
                        update: async () => operations.push("update"),
                    },
                    auditLog: {
                        create: async () => operations.push("audit"),
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            const result = await service.updateRegistration(
                {
                    registrationId: "missing-registration",
                    applicationNotes: "Updated notes",
                },
                "organizer-1",
            );

            assert.equal(result.ok, false);

            if (!result.ok) {
                assert.equal(result.error.code, "REGISTRATION_NOT_FOUND");
            }

            assert.deepEqual(operations, ["lock", "find"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("propagates audit failures during registration updates", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];
        const auditError = new Error("Audit write failed");

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    registration: {
                        findUnique: async () => ({
                            id: "registration-1",
                            applicationNotes: "Old notes",
                        }),
                        update: async () => {
                            operations.push("update");
                        },
                    },
                    auditLog: {
                        create: async () => {
                            operations.push("audit");
                            throw auditError;
                        },
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            await assert.rejects(
                () =>
                    service.updateRegistration(
                        {
                            registrationId: "registration-1",
                            applicationNotes: "Updated notes",
                        },
                        "organizer-1",
                    ),
                auditError,
            );

            assert.deepEqual(operations, ["lock", "update", "audit"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("deletes pending, rejected, and withdrawn registrations with an audit snapshot", async () => {
        const originalTransaction = prisma.$transaction;
        const statuses = ["PENDING", "REJECTED", "WITHDRAWN"] as const;

        try {
            for (const status of statuses) {
                const operations: string[] = [];
                let auditData: Record<string, unknown> | undefined;

                const submittedAt = new Date("2026-11-01T10:00:00.000Z");
                const createdAt = new Date("2026-10-30T10:00:00.000Z");
                const updatedAt = new Date("2026-11-02T10:00:00.000Z");
                const reviewCreatedAt = new Date("2026-11-01T12:00:00.000Z");

                prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                    callback({
                        $queryRaw: async () => {
                            operations.push("lock");
                        },
                        registration: {
                            findUnique: async () => {
                                operations.push("find");
                                return {
                                    id: "registration-1",
                                    teamId: "team-1",
                                    status,
                                    applicationNotes: "Original notes",
                                    submittedAt,
                                    withdrawnAt: null,
                                    createdAt,
                                    updatedAt,
                                    team: {
                                        id: "team-1",
                                        displayName: "Build Team",
                                        loginName: "build-team",
                                        program: "THAI_PROGRAM",
                                        userId: null,
                                    },
                                    reviews: [
                                        {
                                            id: "review-1",
                                            reviewerId: "organizer-2",
                                            decision: "REJECT",
                                            reason: "Incomplete application",
                                            createdAt: reviewCreatedAt,
                                        },
                                    ],
                                };
                            },
                            delete: async () => {
                                operations.push("delete-registration");
                            },
                        },
                        registrationReview: {
                            deleteMany: async () => {
                                operations.push("delete-reviews");
                            },
                        },
                        auditLog: {
                            create: async ({ data }: { data: Record<string, unknown> }) => {
                                operations.push("audit");
                                auditData = data;
                            },
                        },
                    } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

                const result = await service.deleteRegistration({ registrationId: "registration-1" }, "organizer-1");

                assert.deepEqual(result, {
                    ok: true,
                    data: { registrationId: "registration-1" },
                });

                assert.equal(auditData?.actorId, "organizer-1");
                assert.equal(auditData?.action, "REGISTRATION_DELETED");
                assert.equal(auditData?.targetType, "Registration");
                assert.equal(auditData?.targetId, "registration-1");

                assert.deepEqual(operations, [
                    "lock",
                    "lock",
                    "find",
                    "audit",
                    "delete-reviews",
                    "delete-registration",
                ]);

                const details = auditData?.details as {
                    registration: { status: string; applicationNotes: string };
                    team: { id: string; displayName: string };
                    reviews: Array<{ id: string; reason: string }>;
                };

                assert.equal(details.registration.status, status);
                assert.equal(details.registration.applicationNotes, "Original notes");
                assert.equal(details.team.id, "team-1");
                assert.equal(details.team.displayName, "Build Team");
                assert.equal(details.reviews[0].id, "review-1");
                assert.equal(details.reviews[0].reason, "Incomplete application");
            }
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects deletion of approved registrations", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    registration: {
                        findUnique: async () => {
                            operations.push("find");
                            return {
                                id: "registration-1",
                                status: "APPROVED",
                            };
                        },
                        delete: async () => operations.push("delete"),
                    },
                    registrationReview: {
                        deleteMany: async () => operations.push("delete-reviews"),
                    },
                    auditLog: {
                        create: async () => operations.push("audit"),
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            const result = await service.deleteRegistration({ registrationId: "registration-1" }, "organizer-1");

            assert.equal(result.ok, false);

            if (!result.ok) {
                assert.equal(result.error.code, "INVALID_STATUS");
            }

            assert.deepEqual(operations, ["lock", "lock", "find"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("returns REGISTRATION_NOT_FOUND when deleting a missing registration", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    registration: {
                        findUnique: async () => {
                            operations.push("find");
                            return null;
                        },
                        delete: async () => operations.push("delete"),
                    },
                    registrationReview: {
                        deleteMany: async () => operations.push("delete-reviews"),
                    },
                    auditLog: {
                        create: async () => operations.push("audit"),
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            const result = await service.deleteRegistration({ registrationId: "missing-registration" }, "organizer-1");

            assert.equal(result.ok, false);

            if (!result.ok) {
                assert.equal(result.error.code, "REGISTRATION_NOT_FOUND");
            }

            assert.deepEqual(operations, ["lock", "lock", "find"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("propagates audit failures during registration deletion", async () => {
        const originalTransaction = prisma.$transaction;
        const operations: string[] = [];
        const auditError = new Error("Audit write failed");

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    $queryRaw: async () => operations.push("lock"),
                    registration: {
                        findUnique: async () => ({
                            id: "registration-1",
                            teamId: "team-1",
                            status: "PENDING",
                            applicationNotes: null,
                            submittedAt: null,
                            withdrawnAt: null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            team: {
                                id: "team-1",
                                displayName: "Build Team",
                                loginName: "build-team",
                                program: "THAI_PROGRAM",
                                userId: null,
                            },
                            reviews: [],
                        }),
                        delete: async () => operations.push("delete-registration"),
                    },
                    registrationReview: {
                        deleteMany: async () => operations.push("delete-reviews"),
                    },
                    auditLog: {
                        create: async () => {
                            operations.push("audit");
                            throw auditError;
                        },
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            await assert.rejects(
                () => service.deleteRegistration({ registrationId: "registration-1" }, "organizer-1"),
                auditError,
            );

            assert.deepEqual(operations, ["lock", "lock", "audit"]);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });
});
