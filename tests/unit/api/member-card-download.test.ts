import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

const guardsPath = require.resolve("../../../lib/auth/guards");
require.cache[guardsPath] = {
    id: guardsPath,
    filename: guardsPath,
    loaded: true,
    exports: { requireApprovedTeam: async () => ({ team: { id: "team-1" } }) },
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;
let r2: NonNullable<typeof import("@/lib/r2").r2>;
let get: typeof import("@/app/api/participant/member-card/[memberId]/download/route").GET;

before(async () => {
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ r2 } = (await import("@/lib/r2")) as { r2: NonNullable<typeof r2> });
    ({ GET: get } = await import("@/app/api/participant/member-card/[memberId]/download/route"));
});

describe("member-card download route", () => {
    it("queries by both member and authenticated team", async () => {
        const originalFind = prisma.teamMember.findFirst;
        let args: unknown;
        try {
            prisma.teamMember.findFirst = (async (input: unknown) => {
                args = input;
                return null;
            }) as unknown as typeof prisma.teamMember.findFirst;
            const response = await get(new Request("https://example.test") as never, {
                params: Promise.resolve({ memberId: "member-1" }),
            });
            assert.equal(response.status, 404);
            assert.deepEqual(args, {
                where: { id: "member-1", teamId: "team-1" },
                select: { name: true, cardKey: true },
            });
        } finally {
            prisma.teamMember.findFirst = originalFind;
        }
    });

    it("returns 404 when the storage object has no body", async () => {
        const originalFind = prisma.teamMember.findFirst;
        const originalSend = r2.send;
        try {
            prisma.teamMember.findFirst = (async () => ({
                name: "Member",
                cardKey: "cards/member.png",
            })) as unknown as typeof prisma.teamMember.findFirst;
            r2.send = (async () => ({})) as typeof r2.send;
            const response = await get(new Request("https://example.test") as never, {
                params: Promise.resolve({ memberId: "member-1" }),
            });
            assert.equal(response.status, 404);
        } finally {
            prisma.teamMember.findFirst = originalFind;
            r2.send = originalSend;
        }
    });

    it("streams the image as a private attachment with a safe filename", async () => {
        const originalFind = prisma.teamMember.findFirst;
        const originalSend = r2.send;
        try {
            prisma.teamMember.findFirst = (async () => ({
                name: "Jane Doe / Team",
                cardKey: "uploads/team-1/cards/member.png",
            })) as unknown as typeof prisma.teamMember.findFirst;
            r2.send = (async () => ({
                Body: { transformToByteArray: async () => Uint8Array.from([1, 2, 3]) },
            })) as typeof r2.send;
            const response = await get(new Request("https://example.test") as never, {
                params: Promise.resolve({ memberId: "member-1" }),
            });
            assert.equal(response.status, 200);
            assert.equal(response.headers.get("content-type"), "image/png");
            assert.equal(response.headers.get("cache-control"), "private, no-store");
            assert.equal(response.headers.get("content-disposition"), 'attachment; filename="jane-doe-team-card.png"');
            assert.deepEqual(new Uint8Array(await response.arrayBuffer()), Uint8Array.from([1, 2, 3]));
        } finally {
            prisma.teamMember.findFirst = originalFind;
            r2.send = originalSend;
        }
    });
});
