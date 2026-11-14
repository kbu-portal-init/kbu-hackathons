import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let consume: typeof import("@/lib/services/student-email-verification").consumeStudentEmailVerification;
let allMembersVerified: typeof import("@/lib/services/student-email-verification").allMembersVerified;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

    ({ default: prisma } = await import("@/lib/prisma"));

    ({ consumeStudentEmailVerification: consume, allMembersVerified } = await import(
        "@/lib/services/student-email-verification"
    ));
});

describe("student email verification", () => {
    it("hashes tokens before lookup and rejects unknown tokens", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        let tokenHash: string | undefined;

        prisma.studentEmailVerification.findUnique = (async ({ where }: { where: { tokenHash: string } }) => {
            tokenHash = where.tokenHash;
            return null;
        }) as unknown as typeof prisma.studentEmailVerification.findUnique;

        try {
            const result = await consume("raw-token");

            assert.equal(tokenHash, createHash("sha256").update("raw-token").digest("hex"));
            assert.equal(result.ok, false);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
        }
    });

    it("returns already-verified tokens when the recipient email still matches", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        const originalMemberFind = prisma.teamMember.findUnique;
        const originalTransaction = prisma.$transaction;

        const verifiedAt = new Date("2026-01-01T00:00:00.000Z");
        let transactions = 0;

        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            tokenHash: "hash",
            expiresAt: new Date("2099-01-01T00:00:00.000Z"),
            verifiedAt,
            createdAt: verifiedAt,
            recipientEmail: "member@example.edu",
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;

        prisma.teamMember.findUnique = (async () => ({
            studentEmail: "member@example.edu",
        })) as unknown as typeof prisma.teamMember.findUnique;

        prisma.$transaction = (async () => {
            transactions++;
        }) as unknown as typeof prisma.$transaction;

        try {
            assert.deepEqual(await consume("token"), {
                ok: true,
                data: {
                    teamMemberId: "member-1",
                    verifiedAt: verifiedAt.toISOString(),
                    alreadyVerified: true,
                },
            });

            assert.equal(transactions, 0);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
            prisma.teamMember.findUnique = originalMemberFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects already-verified tokens when the recipient email has changed", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        const originalMemberFind = prisma.teamMember.findUnique;

        const verifiedAt = new Date("2026-01-01T00:00:00.000Z");

        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            tokenHash: "hash",
            expiresAt: new Date("2099-01-01T00:00:00.000Z"),
            verifiedAt,
            createdAt: verifiedAt,
            recipientEmail: "old@example.edu",
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;

        prisma.teamMember.findUnique = (async () => ({
            studentEmail: "new@example.edu",
        })) as unknown as typeof prisma.teamMember.findUnique;

        try {
            const result = await consume("token");

            assert.equal(result.ok, false);
            assert.equal(result.ok ? null : result.error.code, "INVALID_VERIFICATION_TOKEN");
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
            prisma.teamMember.findUnique = originalMemberFind;
        }
    });

    it("rejects expired tokens before mutation", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;

        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            recipientEmail: "member@example.edu",
            tokenHash: "hash",
            expiresAt: new Date("2020-01-01T00:00:00.000Z"),
            verifiedAt: null,
            createdAt: new Date(),
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;

        try {
            assert.equal((await consume("token")).ok, false);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
        }
    });

    it("atomically verifies a valid token and member using the recorded recipient email", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        const originalTransaction = prisma.$transaction;

        let memberUpdated = false;

        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            recipientEmail: "member@example.edu",
            tokenHash: "hash",
            expiresAt: new Date("2099-01-01T00:00:00.000Z"),
            verifiedAt: null,
            createdAt: new Date(),
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;

        prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
            callback({
                studentEmailVerification: {
                    updateMany: async () => ({ count: 1 }),
                },
                teamMember: {
                    updateMany: async ({ where }: { where: { studentEmail: string } }) => {
                        assert.equal(where.studentEmail, "member@example.edu");
                        memberUpdated = true;
                        return { count: 1 };
                    },
                },
            } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

        try {
            const result = await consume("token");

            assert.equal(result.ok, true);
            assert.equal(result.ok && result.data.alreadyVerified, false);
            assert.equal(memberUpdated, true);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects a token when the member email no longer matches and rolls back the transaction", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        const originalTransaction = prisma.$transaction;

        let tokenClaimed = false;
        let transactionRolledBack = false;

        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            recipientEmail: "old@example.edu",
            tokenHash: "hash",
            expiresAt: new Date("2099-01-01T00:00:00.000Z"),
            verifiedAt: null,
            createdAt: new Date(),
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;

        prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) => {
            try {
                return await callback({
                    studentEmailVerification: {
                        updateMany: async () => {
                            tokenClaimed = true;
                            return { count: 1 };
                        },
                    },
                    teamMember: {
                        updateMany: async ({ where }: { where: { studentEmail: string } }) => {
                            assert.equal(where.studentEmail, "old@example.edu");
                            return { count: 0 };
                        },
                    },
                } as unknown as typeof prisma);
            } catch (error) {
                transactionRolledBack = true;
                throw error;
            }
        }) as unknown as typeof prisma.$transaction;

        try {
            const result = await consume("token");

            assert.equal(result.ok, false);
            assert.equal(tokenClaimed, true);
            assert.equal(transactionRolledBack, true);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects a token when another request has already claimed it", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        const originalTransaction = prisma.$transaction;

        let memberUpdateAttempted = false;

        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            recipientEmail: "member@example.edu",
            tokenHash: "hash",
            expiresAt: new Date("2099-01-01T00:00:00.000Z"),
            verifiedAt: null,
            createdAt: new Date(),
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;

        prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
            callback({
                studentEmailVerification: {
                    updateMany: async () => ({ count: 0 }),
                },
                teamMember: {
                    updateMany: async () => {
                        memberUpdateAttempted = true;
                        return { count: 1 };
                    },
                },
            } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

        try {
            const result = await consume("token");

            assert.equal(result.ok, false);
            assert.equal(memberUpdateAttempted, false);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("reports whether all team members are verified", async () => {
        const originalCount = prisma.teamMember.count;

        let countWhere: unknown;
        let unverified = 1;

        prisma.teamMember.count = (async (args: unknown) => {
            countWhere = (args as { where: unknown }).where;
            return unverified;
        }) as typeof prisma.teamMember.count;

        try {
            assert.equal(await allMembersVerified("team-1"), false);
            assert.deepEqual(countWhere, {
                teamId: "team-1",
                studentEmailVerifiedAt: null,
            });

            unverified = 0;

            assert.equal(await allMembersVerified("team-1"), true);
            assert.deepEqual(countWhere, {
                teamId: "team-1",
                studentEmailVerifiedAt: null,
            });
        } finally {
            prisma.teamMember.count = originalCount;
        }
    });
});
