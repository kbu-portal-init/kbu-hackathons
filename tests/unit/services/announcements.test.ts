import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

let prisma: typeof import("@/lib/prisma").default;
let service: typeof import("@/lib/services/announcements");

const now = new Date("2026-01-01T00:00:00.000Z");
const announcement = {
    id: "announcement-1",
    title: "News",
    content: "Details",
    imageUrl: null,
    status: "DRAFT",
    publishedAt: null,
    createdById: "admin-1",
    createdAt: now,
    updatedAt: now,
};

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    service = await import("@/lib/services/announcements");
});

async function withTransaction(tx: object, run: () => Promise<void>) {
    const original = prisma.$transaction;
    try {
        prisma.$transaction = (async (callback: (client: typeof prisma) => Promise<unknown>) =>
            callback(tx as typeof prisma)) as unknown as typeof prisma.$transaction;
        await run();
    } finally {
        prisma.$transaction = original;
    }
}

describe("announcement service", () => {
    it("creates drafts and writes an audit record", async () => {
        let createData: unknown;
        let auditData: unknown;
        await withTransaction(
            {
                announcement: {
                    create: async ({ data }: { data: unknown }) => {
                        createData = data;
                        return announcement;
                    },
                },
                auditLog: { create: async ({ data }: { data: unknown }) => (auditData = data) },
            },
            async () => {
                const result = await service.createAnnouncement(
                    { title: "News", content: "Details", imageUrl: "" },
                    "admin-1",
                );
                assert.equal(result.ok, true);
                assert.deepEqual(createData, {
                    title: "News",
                    content: "Details",
                    imageUrl: null,
                    status: "DRAFT",
                    createdById: "admin-1",
                });
                assert.deepEqual(auditData, {
                    actorId: "admin-1",
                    action: "ANNOUNCEMENT_CREATED",
                    targetType: "Announcement",
                    targetId: "announcement-1",
                    details: { title: "News" },
                });
            },
        );
    });

    it("rejects image URLs outside the announcement storage prefix", async () => {
        const result = await service.createAnnouncement(
            { title: "News", content: "Details", imageUrl: "https://attacker.test/image.png" },
            "admin-1",
        );
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "INVALID_ANNOUNCEMENT_IMAGE");
    });

    it("publishes only drafts and records the transition", async () => {
        let updateWhere: unknown;
        let auditAction: unknown;
        const published = { ...announcement, status: "PUBLISHED", publishedAt: now };
        await withTransaction(
            {
                announcement: {
                    updateMany: async ({ where }: { where: unknown }) => {
                        updateWhere = where;
                        return { count: 1 };
                    },
                    findUniqueOrThrow: async () => published,
                },
                auditLog: {
                    create: async ({ data }: { data: { action: string } }) => {
                        auditAction = data.action;
                    },
                },
            },
            async () => {
                const result = await service.publishAnnouncement({ announcementId: "announcement-1" }, "admin-1");
                assert.equal(result.ok, true);
                assert.deepEqual(updateWhere, { id: "announcement-1", status: "DRAFT" });
                assert.equal(auditAction, "ANNOUNCEMENT_PUBLISHED");
            },
        );
    });

    it("distinguishes invalid transitions from missing announcements", async () => {
        for (const [existing, expected] of [
            [true, "ANNOUNCEMENT_INVALID_TRANSITION"],
            [false, "ANNOUNCEMENT_NOT_FOUND"],
        ] as const) {
            await withTransaction(
                {
                    announcement: {
                        updateMany: async () => ({ count: 0 }),
                        findUnique: async () => (existing ? { id: "announcement-1" } : null),
                    },
                },
                async () => {
                    const result = await service.archiveAnnouncement({ announcementId: "announcement-1" }, "admin-1");
                    assert.equal(result.ok, false);
                    if (!result.ok) assert.equal(result.error.code, expected);
                },
            );
        }
    });

    it("deletes only drafts and audits successful deletion", async () => {
        let auditAction: string | undefined;
        await withTransaction(
            {
                announcement: {
                    findUnique: async () => announcement,
                    deleteMany: async () => ({ count: 1 }),
                },
                auditLog: {
                    create: async ({ data }: { data: { action: string } }) => {
                        auditAction = data.action;
                    },
                },
            },
            async () => {
                const result = await service.deleteAnnouncement({ announcementId: "announcement-1" }, "admin-1");
                assert.equal(result.ok, true);
                assert.equal(auditAction, "ANNOUNCEMENT_DELETED");
            },
        );

        await withTransaction(
            { announcement: { findUnique: async () => ({ ...announcement, status: "PUBLISHED" }) } },
            async () => {
                const result = await service.deleteAnnouncement({ announcementId: "announcement-1" }, "admin-1");
                assert.equal(result.ok, false);
                if (!result.ok) assert.equal(result.error.code, "ANNOUNCEMENT_INVALID_TRANSITION");
            },
        );
    });
});
