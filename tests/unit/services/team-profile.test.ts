import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

let prisma: typeof import("@/lib/prisma").default;
let updateTeamLogo: typeof import("@/lib/services/team-settings").updateTeamLogo;
let updateMemberImage: typeof import("@/lib/services/team-members").updateMemberImage;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ updateTeamLogo } = await import("@/lib/services/team-settings"));
    ({ updateMemberImage } = await import("@/lib/services/team-members"));
});

describe("team profile services", () => {
    it("updates logos only for existing teams", async () => {
        const originalFind = prisma.team.findUnique;
        const originalUpdate = prisma.team.update;
        let updateArgs: unknown;
        try {
            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;
            const missing = await updateTeamLogo("team-1", { imageUrl: "https://media.example.test/logo.png" });
            assert.equal(missing.ok, false);
            if (!missing.ok) assert.equal(missing.error.code, "TEAM_NOT_FOUND");

            prisma.team.findUnique = (async () => ({ id: "team-1" })) as unknown as typeof prisma.team.findUnique;
            prisma.team.update = (async (args: unknown) => {
                updateArgs = args;
                return {};
            }) as unknown as typeof prisma.team.update;
            const result = await updateTeamLogo("team-1", { imageUrl: "https://media.example.test/logo.png" });
            assert.equal(result.ok, true);
            assert.deepEqual(updateArgs, {
                where: { id: "team-1" },
                data: { imageUrl: "https://media.example.test/logo.png" },
            });
        } finally {
            prisma.team.findUnique = originalFind;
            prisma.team.update = originalUpdate;
        }
    });

    it("enforces member ownership and team-scoped image URLs", async () => {
        const originalFind = prisma.teamMember.findFirst;
        const originalUpdate = prisma.teamMember.update;
        try {
            const foreignImage = await updateMemberImage("team-1", {
                memberId: "member-1",
                imageUrl: "https://media.example.test/uploads/team-2/member.png",
            });
            assert.equal(foreignImage.ok, false);
            if (!foreignImage.ok) assert.equal(foreignImage.error.code, "IMAGE_NOT_OWNED");

            prisma.teamMember.findFirst = (async () => null) as unknown as typeof prisma.teamMember.findFirst;
            const missing = await updateMemberImage("team-1", { memberId: "member-1", imageUrl: null });
            assert.equal(missing.ok, false);
            if (!missing.ok) assert.equal(missing.error.code, "TEAM_MEMBER_NOT_FOUND");

            let updateArgs: unknown;
            prisma.teamMember.findFirst = (async () => ({
                id: "member-1",
            })) as unknown as typeof prisma.teamMember.findFirst;
            prisma.teamMember.update = (async (args: unknown) => {
                updateArgs = args;
                return {};
            }) as unknown as typeof prisma.teamMember.update;
            const result = await updateMemberImage("team-1", {
                memberId: "member-1",
                imageUrl: "https://media.example.test/uploads/team-1/member.png",
            });
            assert.equal(result.ok, true);
            assert.deepEqual(updateArgs, {
                where: { id: "member-1" },
                data: { imageUrl: "https://media.example.test/uploads/team-1/member.png" },
            });
        } finally {
            prisma.teamMember.findFirst = originalFind;
            prisma.teamMember.update = originalUpdate;
        }
    });

    it("maps persistence failures to update errors", async () => {
        const originalFind = prisma.team.findUnique;
        try {
            prisma.team.findUnique = (async () => {
                throw new Error("database unavailable");
            }) as unknown as typeof prisma.team.findUnique;
            const result = await updateTeamLogo("team-1", { imageUrl: null });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "UPDATE_FAILED");
        } finally {
            prisma.team.findUnique = originalFind;
        }
    });
});
