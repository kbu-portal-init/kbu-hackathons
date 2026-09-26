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

    it("returns already-verified tokens without mutating them", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
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
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;
        prisma.$transaction = (async () => {
            transactions++;
        }) as unknown as typeof prisma.$transaction;
        try {
            assert.deepEqual(await consume("token"), {
                ok: true,
                data: { teamMemberId: "member-1", verifiedAt: verifiedAt.toISOString(), alreadyVerified: true },
            });
            assert.equal(transactions, 0);
        } finally {
            prisma.studentEmailVerification.findUnique = originalFind;
            prisma.$transaction = originalTransaction;
        }
    });

    it("rejects expired tokens before mutation", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
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

    it("atomically verifies a valid token and member", async () => {
        const originalFind = prisma.studentEmailVerification.findUnique;
        const originalTransaction = prisma.$transaction;
        let memberUpdated = false;
        prisma.studentEmailVerification.findUnique = (async () => ({
            id: "verification-1",
            teamMemberId: "member-1",
            tokenHash: "hash",
            expiresAt: new Date("2099-01-01T00:00:00.000Z"),
            verifiedAt: null,
            createdAt: new Date(),
        })) as unknown as typeof prisma.studentEmailVerification.findUnique;
        prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
            callback({
                studentEmailVerification: { updateMany: async () => ({ count: 1 }) },
                teamMember: {
                    update: async () => {
                        memberUpdated = true;
                        return {};
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
            assert.deepEqual(countWhere, { teamId: "team-1", studentEmailVerifiedAt: null });

            unverified = 0;
            assert.equal(await allMembersVerified("team-1"), true);
            assert.deepEqual(countWhere, { teamId: "team-1", studentEmailVerifiedAt: null });
        } finally {
            prisma.teamMember.count = originalCount;
        }
    });
});
