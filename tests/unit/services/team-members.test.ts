import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let createTeamMember: typeof import("@/lib/services/team-members").createTeamMember;
let updateTeamMember: typeof import("@/lib/services/team-members").updateTeamMember;
let deleteTeamMember: typeof import("@/lib/services/team-members").deleteTeamMember;
let updateManagementMemberImage: typeof import("@/lib/services/team-members").updateManagementMemberImage;

process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

type TransactionMock = {
    $queryRaw: (...args: unknown[]) => Promise<unknown>;
    team: {
        findUnique: (...args: unknown[]) => Promise<unknown>;
    };
    eventSettings: {
        findUnique: (...args: unknown[]) => Promise<unknown>;
    };
    teamMember: {
        count?: (...args: unknown[]) => Promise<number>;
        findFirst?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
    };
    studentEmailVerification: {
        deleteMany: (...args: unknown[]) => Promise<unknown>;
    };
    auditLog: {
        create: (args: { data: unknown }) => Promise<unknown>;
    };
};

const input = {
    teamId: "team-1",
    name: "Test Member",
    studentEmail: "u123456789012@ms.kbu.ac.th",
    role: "DEVELOPER" as const,
};

const member = {
    id: "member-1",
    name: input.name,
    studentEmail: input.studentEmail,
    role: input.role,
};

const updateInput = {
    teamId: "team-1",
    memberId: "member-1",
    name: "Updated Member",
    studentEmail: "u123456789013@ms.kbu.ac.th",
    role: "DESIGNER" as const,
};

const existingMember = {
    id: "member-1",
    name: "Test Member",
    studentEmail: input.studentEmail,
    role: "DEVELOPER",
    studentEmailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const updatedMember = {
    id: "member-1",
    name: updateInput.name,
    studentEmail: updateInput.studentEmail,
    role: updateInput.role,
    studentEmailVerifiedAt: null,
};

const deleteInput = {
    teamId: "team-1",
    memberId: "member-1",
};

const memberToDelete = {
    id: "member-1",
    name: "Test Member",
    studentEmail: input.studentEmail,
    role: "DEVELOPER",
    cardKey: "uploads/team-1/cards/member-1-card.png",
};

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

    ({ default: prisma } = await import("@/lib/prisma"));
    const teamMemberService = await import("@/lib/services/team-members");

    ({ createTeamMember, updateTeamMember, deleteTeamMember } = teamMemberService);
    ({ updateManagementMemberImage } = await import("@/lib/services/team-members"));
});

async function withTransaction<T>(tx: TransactionMock, run: () => Promise<T>): Promise<T> {
    const originalTransaction = prisma.$transaction;

    prisma.$transaction = (async (callback: (client: typeof prisma) => Promise<unknown>) =>
        callback(tx as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

    try {
        return await run();
    } finally {
        prisma.$transaction = originalTransaction;
    }
}

function createTransaction(overrides: Partial<TransactionMock> = {}): TransactionMock {
    return {
        $queryRaw: async () => [],
        team: {
            findUnique: async () => ({ id: input.teamId }),
        },
        eventSettings: {
            findUnique: async () => ({
                maxTeamSize: 5,
                minTeamSize: 2,
            }),
        },
        teamMember: {
            count: async () => 2,
            findFirst: async () => null,
            create: async () => member,
            update: async () => ({
                ...member,
                studentEmailVerifiedAt: null,
            }),
            delete: async () => ({}),
        },
        studentEmailVerification: {
            deleteMany: async () => ({ count: 0 }),
        },
        auditLog: {
            create: async () => ({}),
        },
        ...overrides,
    };
}

describe("createTeamMember", () => {
    it("creates a member and writes an audit log in the same transaction", async () => {
        let memberCreated = false;
        let auditCreated = false;
        let auditData: unknown;
        let lockedTeam = false;

        const tx = createTransaction({
            $queryRaw: async (...args) => {
                lockedTeam = String(args[0]).includes('"team"');
                return [];
            },
            teamMember: {
                count: async () => 2,
                findFirst: async () => null,
                create: async () => {
                    memberCreated = true;
                    return member;
                },
            },
            auditLog: {
                create: async ({ data }: { data: unknown }) => {
                    assert.equal(memberCreated, true);
                    auditCreated = true;
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => createTeamMember(input, "organizer-1"));

        assert.deepEqual(result, { ok: true, data: member });
        assert.equal(lockedTeam, true);
        assert.equal(memberCreated, true);
        assert.equal(auditCreated, true);
        assert.deepEqual(auditData, {
            actorId: "organizer-1",
            action: "TEAM_MEMBER_CREATED",
            targetType: "TeamMember",
            targetId: member.id,
            details: {
                teamId: input.teamId,
                name: input.name,
                studentEmail: input.studentEmail,
                role: input.role,
            },
        });
    });

    it("rejects creation when the team does not exist", async () => {
        let memberCreated = false;

        const tx = createTransaction({
            team: {
                findUnique: async () => null,
            },
            teamMember: {
                count: async () => 3,
                findFirst: async () => null,
                create: async () => {
                    memberCreated = true;
                    return member;
                },
            },
        });

        const result = await withTransaction(tx, () => createTeamMember(input, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_NOT_FOUND");
        }
        assert.equal(memberCreated, false);
    });

    it("rejects creation when event settings are missing", async () => {
        const tx = createTransaction({
            eventSettings: {
                findUnique: async () => null,
            },
        });

        const result = await withTransaction(tx, () => createTeamMember(input, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "EVENT_NOT_CONFIGURED");
        }
    });

    it("rejects creation when the team has reached its maximum size", async () => {
        let memberCreated = false;

        const tx = createTransaction({
            eventSettings: {
                findUnique: async () => ({ maxTeamSize: 3 }),
            },
            teamMember: {
                count: async () => 3,
                findFirst: async () => null,
                create: async () => {
                    memberCreated = true;
                    return member;
                },
            },
        });

        const result = await withTransaction(tx, () => createTeamMember(input, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "INVALID_TEAM_SIZE");
        }
        assert.equal(memberCreated, false);
    });

    it("rejects creating a second team leader", async () => {
        const tx = createTransaction({
            teamMember: {
                count: async () => 2,
                findFirst: async () => ({ id: "existing-leader" }),
                create: async () => member,
            },
        });

        const result = await withTransaction(tx, () => createTeamMember({ ...input, role: "LEADER" }, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_LEADER_ALREADY_EXISTS");
        }
    });

    it("maps duplicate student email errors to EMAIL_EXISTS", async () => {
        const duplicateError = Object.assign(
            new Error("Unique constraint failed on the constraint: team_member_student_email_key"),
            {
                code: "P2002",
                meta: {
                    target: "team_member_student_email_key",
                },
            },
        );

        const tx = createTransaction({
            teamMember: {
                count: async () => 2,
                findFirst: async () => null,
                create: async () => {
                    throw duplicateError;
                },
            },
        });

        const result = await withTransaction(tx, () => createTeamMember(input, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "EMAIL_EXISTS");
        }
    });

    it("returns CREATE_FAILED when audit logging fails", async () => {
        const tx = createTransaction({
            auditLog: {
                create: async () => {
                    throw new Error("Audit database failure");
                },
            },
        });

        const result = await withTransaction(tx, () => createTeamMember(input, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "CREATE_FAILED");
        }
    });
});

describe("updateTeamMember", () => {
    it("updates a member and writes an audit log in the same transaction", async () => {
        let memberUpdated = false;
        let auditCreated = false;
        let lockedTeam = false;
        let auditData: unknown;

        const tx = createTransaction({
            $queryRaw: async (...args) => {
                lockedTeam = String(args[0]).includes('"team"');
                return [];
            },
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === updateInput.memberId ? existingMember : null;
                },
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    assert.equal(memberUpdated, true);
                    auditCreated = true;
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.deepEqual(result, {
            ok: true,
            data: {
                ...updatedMember,
                emailChanged: true,
            },
        });

        assert.equal(lockedTeam, true);
        assert.equal(memberUpdated, true);
        assert.equal(auditCreated, true);

        assert.deepEqual(auditData, {
            actorId: "organizer-1",
            action: "TEAM_MEMBER_UPDATED",
            targetType: "TeamMember",
            targetId: existingMember.id,
            details: {
                teamId: updateInput.teamId,
                previous: {
                    name: existingMember.name,
                    studentEmail: existingMember.studentEmail,
                    role: existingMember.role,
                },
                updated: {
                    name: updatedMember.name,
                    studentEmail: updatedMember.studentEmail,
                    role: updatedMember.role,
                },
                emailChanged: true,
            },
        });
    });

    it("resets email verification and invalidates outstanding tokens when the email changes", async () => {
        let deleteManyCalled = false;
        let updateData: unknown;
        let deleteManyArgs: unknown;

        const tx = createTransaction({
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === updateInput.memberId ? existingMember : null;
                },
                update: async (...args: unknown[]) => {
                    updateData = (args[0] as { data: unknown }).data;
                    return updatedMember;
                },
            },
            studentEmailVerification: {
                deleteMany: async (...args: unknown[]) => {
                    deleteManyCalled = true;
                    deleteManyArgs = args[0];
                    return { count: 1 };
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, true);
        assert.equal(deleteManyCalled, true);

        assert.deepEqual(updateData, {
            name: updateInput.name,
            studentEmail: updateInput.studentEmail,
            role: updateInput.role,
            studentEmailVerifiedAt: null,
        });

        assert.deepEqual(deleteManyArgs, {
            where: {
                teamMemberId: updateInput.memberId,
                verifiedAt: null,
            },
        });
    });

    it("does not invalidate verification tokens when the email remains unchanged", async () => {
        let deleteManyCalled = false;
        let updateData: unknown;

        const unchangedEmailInput = {
            ...updateInput,
            studentEmail: existingMember.studentEmail,
        };

        const tx = createTransaction({
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === updateInput.memberId ? existingMember : null;
                },
                update: async (...args: unknown[]) => {
                    updateData = (args[0] as { data: unknown }).data;

                    return {
                        ...updatedMember,
                        studentEmail: existingMember.studentEmail,
                        studentEmailVerifiedAt: existingMember.studentEmailVerifiedAt,
                    };
                },
            },
            studentEmailVerification: {
                deleteMany: async () => {
                    deleteManyCalled = true;
                    return { count: 0 };
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(unchangedEmailInput, "organizer-1"));

        assert.equal(result.ok, true);
        assert.equal(deleteManyCalled, false);

        assert.deepEqual(updateData, {
            name: unchangedEmailInput.name,
            studentEmail: unchangedEmailInput.studentEmail,
            role: unchangedEmailInput.role,
        });

        if (result.ok) {
            assert.equal(result.data.emailChanged, false);
            assert.equal(result.data.studentEmailVerifiedAt, existingMember.studentEmailVerifiedAt);
        }
    });

    it("prevents demoting the only team leader", async () => {
        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === updateInput.memberId ? { ...existingMember, role: "LEADER" } : null;
                },
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_LEADER_REQUIRED");
        }

        assert.equal(memberUpdated, false);
    });

    it("allows demoting a leader when another leader exists", async () => {
        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === updateInput.memberId
                        ? { ...existingMember, role: "LEADER" }
                        : { id: "member-2" };
                },
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, true);
        assert.equal(memberUpdated, true);
    });

    it("prevents promoting a member when another leader already exists", async () => {
        const promotionInput = {
            ...updateInput,
            role: "LEADER" as const,
        };

        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === promotionInput.memberId ? existingMember : { id: "existing-leader" };
                },
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(promotionInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_LEADER_ALREADY_EXISTS");
        }

        assert.equal(memberUpdated, false);
    });

    it("allows promoting a member when no other leader exists", async () => {
        const promotionInput = {
            ...updateInput,
            role: "LEADER" as const,
        };

        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async (...args: unknown[]) => {
                    const query = args[0] as {
                        where?: { id?: string };
                    };

                    return query.where?.id === promotionInput.memberId ? existingMember : null;
                },
                update: async () => {
                    memberUpdated = true;
                    return {
                        ...updatedMember,
                        role: "LEADER",
                    };
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(promotionInput, "organizer-1"));

        assert.equal(result.ok, true);
        assert.equal(memberUpdated, true);

        if (result.ok) {
            assert.equal(result.data.role, "LEADER");
        }
    });

    it("rejects updating a member when the team does not exist", async () => {
        let memberUpdated = false;

        const tx = createTransaction({
            team: {
                findUnique: async () => null,
            },
            teamMember: {
                findFirst: async () => existingMember,
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_NOT_FOUND");
        }

        assert.equal(memberUpdated, false);
    });

    it("rejects updating a member that does not belong to the team", async () => {
        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async () => null,
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_MEMBER_NOT_FOUND");
        }

        assert.equal(memberUpdated, false);
    });

    it("maps duplicate student email errors during update to EMAIL_EXISTS", async () => {
        const duplicateError = Object.assign(
            new Error("Unique constraint failed on the constraint: team_member_student_email_key"),
            {
                code: "P2002",
                meta: {
                    target: "team_member_student_email_key",
                },
            },
        );

        const tx = createTransaction({
            teamMember: {
                findFirst: async () => existingMember,
                update: async () => {
                    throw duplicateError;
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "EMAIL_EXISTS");
        }
    });

    it("returns UPDATE_FAILED when audit logging fails", async () => {
        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async () => existingMember,
                update: async () => {
                    memberUpdated = true;
                    return updatedMember;
                },
            },
            auditLog: {
                create: async () => {
                    throw new Error("Audit database failure");
                },
            },
        });

        const result = await withTransaction(tx, () => updateTeamMember(updateInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "UPDATE_FAILED");
        }

        assert.equal(memberUpdated, true);
    });
});

describe("deleteTeamMember", () => {
    it("deletes a member and writes an audit log in the same transaction", async () => {
        let memberDeleted = false;
        let auditCreated = false;
        let auditData: unknown;
        let cleanupCalled = false;

        const tx = createTransaction({
            teamMember: {
                count: async () => 3,
                findFirst: async () => memberToDelete,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    assert.equal(memberDeleted, true);
                    auditCreated = true;
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () =>
            deleteTeamMember(deleteInput, "organizer-1", async () => {
                cleanupCalled = true;
                return { ok: true, data: { ok: true } };
            }),
        );

        assert.equal(result.ok, true);
        assert.equal(memberDeleted, true);
        assert.equal(auditCreated, true);
        assert.equal(cleanupCalled, true);

        assert.deepEqual(auditData, {
            actorId: "organizer-1",
            action: "TEAM_MEMBER_DELETED",
            targetType: "TeamMember",
            targetId: memberToDelete.id,
            details: {
                teamId: deleteInput.teamId,
                name: memberToDelete.name,
                studentEmail: memberToDelete.studentEmail,
                role: memberToDelete.role,
                cardKey: memberToDelete.cardKey,
            },
        });

        if (result.ok) {
            assert.equal(result.data.id, memberToDelete.id);
            assert.equal(result.data.cardCleanupFailed, false);
        }
    });

    it("rejects deletion when the team does not exist", async () => {
        let memberDeleted = false;

        const tx = createTransaction({
            team: {
                findUnique: async () => null,
            },
            teamMember: {
                count: async () => 3,
                findFirst: async () => memberToDelete,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => deleteTeamMember(deleteInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_NOT_FOUND");
        }

        assert.equal(memberDeleted, false);
    });

    it("rejects deletion when the member does not belong to the team", async () => {
        let memberDeleted = false;

        const tx = createTransaction({
            teamMember: {
                count: async () => 3,
                findFirst: async () => null,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => deleteTeamMember(deleteInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_MEMBER_NOT_FOUND");
        }

        assert.equal(memberDeleted, false);
    });

    it("rejects deletion when event settings are missing", async () => {
        let memberDeleted = false;

        const tx = createTransaction({
            eventSettings: {
                findUnique: async () => null,
            },
            teamMember: {
                count: async () => 3,
                findFirst: async () => memberToDelete,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => deleteTeamMember(deleteInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "EVENT_NOT_CONFIGURED");
        }

        assert.equal(memberDeleted, false);
    });

    it("rejects deletion when the remaining team size would be below the minimum", async () => {
        let memberDeleted = false;

        const tx = createTransaction({
            teamMember: {
                count: async () => 2,
                findFirst: async () => memberToDelete,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => deleteTeamMember(deleteInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "INVALID_TEAM_SIZE");
        }

        assert.equal(memberDeleted, false);
    });

    it("prevents deleting the only team leader", async () => {
        let memberDeleted = false;

        const leader = { ...memberToDelete, role: "LEADER" };

        const tx = createTransaction({
            teamMember: {
                count: async () => 3,
                findFirst: async (args: unknown) => {
                    const query = args as { where?: { role?: string } };

                    return query.where?.role === "LEADER" ? null : leader;
                },
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => deleteTeamMember(deleteInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_LEADER_REQUIRED");
        }

        assert.equal(memberDeleted, false);
    });

    it("allows deleting a leader when another leader exists", async () => {
        let memberDeleted = false;

        const leader = { ...memberToDelete, role: "LEADER" };

        const tx = createTransaction({
            teamMember: {
                count: async () => 3,
                findFirst: async (args: unknown) => {
                    const query = args as { where?: { role?: string } };

                    return query.where?.role === "LEADER" ? { id: "member-2" } : leader;
                },
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () =>
            deleteTeamMember(deleteInput, "organizer-1", async () => ({
                ok: true,
                data: { ok: true },
            })),
        );

        assert.equal(result.ok, true);
        assert.equal(memberDeleted, true);
    });

    it("reports R2 cleanup failure without undoing the database deletion", async () => {
        let memberDeleted = false;
        let auditCreated = false;

        const tx = createTransaction({
            teamMember: {
                count: async () => 3,
                findFirst: async () => memberToDelete,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
            auditLog: {
                create: async () => {
                    auditCreated = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () =>
            deleteTeamMember(deleteInput, "organizer-1", async () => ({
                ok: false,
                error: {
                    code: "DELETE_FAILED",
                    message: "Storage cleanup failed",
                },
            })),
        );

        assert.equal(result.ok, true);
        assert.equal(memberDeleted, true);
        assert.equal(auditCreated, true);

        if (result.ok) {
            assert.equal(result.data.id, memberToDelete.id);
            assert.equal(result.data.cardCleanupFailed, true);
        }
    });

    it("returns DELETE_FAILED when audit logging fails", async () => {
        let memberDeleted = false;

        const tx = createTransaction({
            teamMember: {
                count: async () => 3,
                findFirst: async () => memberToDelete,
                delete: async () => {
                    memberDeleted = true;
                    return {};
                },
            },
            auditLog: {
                create: async () => {
                    throw new Error("Audit database failure");
                },
            },
        });

        const result = await withTransaction(tx, () => deleteTeamMember(deleteInput, "organizer-1"));

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "DELETE_FAILED");
        }

        assert.equal(memberDeleted, true);
    });
});

describe("updateManagementMemberImage", () => {
    const imageInput = {
        teamId: "team-1",
        memberId: "member-1",
        imageUrl: "https://media.example.test/uploads/team-1/member.png",
    };

    it("rejects an image belonging to another team's storage", async () => {
        let transactionStarted = false;
        const originalTransaction = prisma.$transaction;

        prisma.$transaction = (async () => {
            transactionStarted = true;
            return {};
        }) as unknown as typeof prisma.$transaction;

        try {
            const result = await updateManagementMemberImage(
                {
                    ...imageInput,
                    imageUrl: "https://media.example.test/uploads/team-2/member.png",
                },
                "organizer-1",
            );

            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "IMAGE_NOT_OWNED");
            assert.equal(transactionStarted, false);
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects updates for a team that does not exist", async () => {
        const tx = createTransaction({
            team: {
                findUnique: async () => null,
            },
        });

        const result = await withTransaction(tx, () => updateManagementMemberImage(imageInput, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "TEAM_NOT_FOUND");
    });

    it("rejects updates for a member outside the specified team", async () => {
        const tx = createTransaction({
            teamMember: {
                findFirst: async () => null,
            },
        });

        const result = await withTransaction(tx, () => updateManagementMemberImage(imageInput, "organizer-1"));

        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "TEAM_MEMBER_NOT_FOUND");
    });

    it("updates the image and writes an audit log in the same transaction", async () => {
        let teamLocked = false;
        let memberUpdated = false;
        let auditCreated = false;
        let auditData: unknown;
        let updateArgs: unknown;

        const tx = createTransaction({
            $queryRaw: async (...args) => {
                teamLocked = String(args[0]).includes('"team"');
                return [];
            },
            teamMember: {
                findFirst: async () => ({
                    id: "member-1",
                    imageUrl: "https://media.example.test/uploads/team-1/old.png",
                }),
                update: async (args: unknown) => {
                    updateArgs = args;
                    memberUpdated = true;
                    return {};
                },
            },
            auditLog: {
                create: async ({ data }: { data: unknown }) => {
                    assert.equal(memberUpdated, true);
                    auditCreated = true;
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => updateManagementMemberImage(imageInput, "organizer-1"));

        assert.deepEqual(result, {
            ok: true,
            data: { imageUrl: imageInput.imageUrl },
        });

        assert.equal(teamLocked, true);
        assert.equal(memberUpdated, true);
        assert.equal(auditCreated, true);

        assert.deepEqual(updateArgs, {
            where: { id: imageInput.memberId },
            data: { imageUrl: imageInput.imageUrl },
        });

        assert.deepEqual(auditData, {
            actorId: "organizer-1",
            action: "TEAM_MEMBER_IMAGE_UPDATED",
            targetType: "TeamMember",
            targetId: imageInput.memberId,
            details: {
                teamId: imageInput.teamId,
                previousImageUrl: "https://media.example.test/uploads/team-1/old.png",
                imageUrl: imageInput.imageUrl,
            },
        });
    });

    it("does not create an audit entry when the image is unchanged", async () => {
        let memberUpdated = false;
        let auditCreated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async () => ({
                    id: "member-1",
                    imageUrl: imageInput.imageUrl,
                }),
                update: async () => {
                    memberUpdated = true;
                    return {};
                },
            },
            auditLog: {
                create: async () => {
                    auditCreated = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => updateManagementMemberImage(imageInput, "organizer-1"));

        assert.deepEqual(result, {
            ok: true,
            data: { imageUrl: imageInput.imageUrl },
        });
        assert.equal(memberUpdated, false);
        assert.equal(auditCreated, false);
    });

    it("returns UPDATE_FAILED when audit logging fails", async () => {
        let memberUpdated = false;

        const tx = createTransaction({
            teamMember: {
                findFirst: async () => ({
                    id: "member-1",
                    imageUrl: null,
                }),
                update: async () => {
                    memberUpdated = true;
                    return {};
                },
            },
            auditLog: {
                create: async () => {
                    throw new Error("Audit database failure");
                },
            },
        });

        const result = await withTransaction(tx, () => updateManagementMemberImage(imageInput, "organizer-1"));

        assert.equal(memberUpdated, true);
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "UPDATE_FAILED");
    });
});
