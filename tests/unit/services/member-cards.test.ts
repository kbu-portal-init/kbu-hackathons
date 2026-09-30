import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

const nextOgPath = require.resolve("next/og");
require.cache[nextOgPath] = {
    id: nextOgPath,
    filename: nextOgPath,
    loaded: true,
    exports: {
        ImageResponse: class {
            async arrayBuffer() {
                return Uint8Array.from([1, 2, 3]).buffer;
            }
        },
    },
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;
let r2: NonNullable<typeof import("@/lib/r2").r2>;
let generateMemberCard: typeof import("@/lib/services/member-cards").generateMemberCard;

before(async () => {
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ r2 } = (await import("@/lib/r2")) as { r2: NonNullable<typeof r2> });
    ({ generateMemberCard } = await import("@/lib/services/member-cards"));
});

describe("member card generation", () => {
    it("requires a member owned by the requesting team", async () => {
        const originalFind = prisma.teamMember.findFirst;
        try {
            let args: unknown;
            prisma.teamMember.findFirst = (async (input: unknown) => {
                args = input;
                return null;
            }) as unknown as typeof prisma.teamMember.findFirst;
            const result = await generateMemberCard("team-1", { memberId: "member-1" });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "MEMBER_NOT_FOUND");
            assert.deepEqual(args, {
                where: { id: "member-1", teamId: "team-1" },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    cardKey: true,
                    team: { select: { displayName: true } },
                },
            });
        } finally {
            prisma.teamMember.findFirst = originalFind;
        }
    });

    it("uploads a card, saves its share token, and deletes the previous object", async () => {
        const originalFind = prisma.teamMember.findFirst;
        const originalEvent = prisma.eventSettings.findUnique;
        const originalUpdate = prisma.teamMember.update;
        const originalSend = r2.send;
        const commands: unknown[] = [];
        let updateData: { cardKey: string; cardUrl: string; cardShareToken: string } | undefined;
        try {
            prisma.teamMember.findFirst = (async () => ({
                id: "member-1",
                name: "Member",
                role: "DEVELOPER",
                cardKey: "uploads/team-1/cards/old.png",
                team: { displayName: "Team One" },
            })) as unknown as typeof prisma.teamMember.findFirst;
            prisma.eventSettings.findUnique = (async () => ({
                startsAt: new Date("2026-11-09"),
                endsAt: new Date("2026-11-10"),
            })) as unknown as typeof prisma.eventSettings.findUnique;
            prisma.teamMember.update = (async ({ data }: { data: typeof updateData }) => {
                updateData = data;
                return {};
            }) as unknown as typeof prisma.teamMember.update;
            r2.send = (async (command: unknown) => {
                commands.push(command);
                return {};
            }) as typeof r2.send;

            const result = await generateMemberCard("team-1", { memberId: "member-1" });
            assert.equal(result.ok, true);
            assert.ok(updateData);
            assert.ok(updateData.cardKey.startsWith("uploads/team-1/cards/member-1-"));
            assert.equal(updateData.cardUrl, `https://media.example.test/${updateData.cardKey}`);
            assert.ok(updateData.cardShareToken);
            assert.equal(commands.length, 2);
        } finally {
            prisma.teamMember.findFirst = originalFind;
            prisma.eventSettings.findUnique = originalEvent;
            prisma.teamMember.update = originalUpdate;
            r2.send = originalSend;
        }
    });

    it("deletes a newly uploaded object when persistence fails", async () => {
        const originalFind = prisma.teamMember.findFirst;
        const originalEvent = prisma.eventSettings.findUnique;
        const originalUpdate = prisma.teamMember.update;
        const originalSend = r2.send;
        const commands: unknown[] = [];
        try {
            prisma.teamMember.findFirst = (async () => ({
                id: "member-1",
                name: "Member",
                role: "DESIGNER",
                cardKey: null,
                team: { displayName: "Team One" },
            })) as unknown as typeof prisma.teamMember.findFirst;
            prisma.eventSettings.findUnique = (async () => null) as unknown as typeof prisma.eventSettings.findUnique;
            prisma.teamMember.update = (async () => {
                throw new Error("database unavailable");
            }) as unknown as typeof prisma.teamMember.update;
            r2.send = (async (command: unknown) => {
                commands.push(command);
                return {};
            }) as typeof r2.send;
            const result = await generateMemberCard("team-1", { memberId: "member-1" });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "CARD_GENERATION_FAILED");
            assert.equal(commands.length, 2);
        } finally {
            prisma.teamMember.findFirst = originalFind;
            prisma.eventSettings.findUnique = originalEvent;
            prisma.teamMember.update = originalUpdate;
            r2.send = originalSend;
        }
    });
});
