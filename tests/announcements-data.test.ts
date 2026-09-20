import "dotenv/config";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { AnnouncementStatus } from "@/lib/contracts/announcements";

const serverOnlyPath = require.resolve("server-only");

require.cache[serverOnlyPath] = {
    exports: {},
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;

let listAnnouncements: typeof import("@/lib/data/announcements").listAnnouncements;
let listPublicAnnouncements: typeof import("@/lib/data/announcements").listPublicAnnouncements;

let testUserId: string;

const createdAnnouncementIds: string[] = [];

async function loadDependencies() {
    prisma = (await import("@/lib/prisma")).default;

    const data = await import("@/lib/data/announcements");

    listAnnouncements = data.listAnnouncements;
    listPublicAnnouncements = data.listPublicAnnouncements;
}

async function createTestUser() {
    const now = new Date();

    const user = await prisma.user.create({
        data: {
            id: crypto.randomUUID(),
            email: `announcement-data-test-${Date.now()}@example.test`,
            name: "Announcement Data Test User",
            role: "admin",
            emailVerified: true,
            createdAt: now,
            updatedAt: now,
        },
    });

    testUserId = user.id;
}

async function createTestAnnouncement(input: {
    title: string;
    content: string;
    status?: AnnouncementStatus;
    publishedAt?: Date | null;
}) {
    const status = input.status ?? "DRAFT";

    const announcement = await prisma.announcement.create({
        data: {
            title: input.title,
            content: input.content,
            status,
            publishedAt: input.publishedAt ?? (status === "PUBLISHED" ? new Date() : null),
            createdById: testUserId,
        },
    });

    createdAnnouncementIds.push(announcement.id);

    return announcement;
}

before(async () => {
    await loadDependencies();
    await createTestUser();
});

after(async () => {
    if (createdAnnouncementIds.length > 0) {
        await prisma.announcement.deleteMany({
            where: {
                id: {
                    in: createdAnnouncementIds,
                },
            },
        });
    }

    if (testUserId) {
        await prisma.user.delete({
            where: {
                id: testUserId,
            },
        });
    }

    await prisma.$disconnect();
});

describe("announcement data", () => {
    it("paginates announcements", async () => {
        await createTestAnnouncement({
            title: "Pagination Announcement 1",
            content: "Pagination content 1",
        });

        await createTestAnnouncement({
            title: "Pagination Announcement 2",
            content: "Pagination content 2",
        });

        await createTestAnnouncement({
            title: "Pagination Announcement 3",
            content: "Pagination content 3",
        });

        const result = await listAnnouncements({
            page: 1,
            pageSize: 2,
        });

        assert.equal(result.meta.page, 1);
        assert.equal(result.meta.pageSize, 2);
        assert.equal(result.items.length, 2);
        assert.ok(result.meta.total >= 3);
        assert.equal(result.meta.hasNextPage, true);
    });

    it("filters announcements by status", async () => {
        await createTestAnnouncement({
            title: "Status Draft Announcement",
            content: "Status filter content",
            status: "DRAFT",
        });

        await createTestAnnouncement({
            title: "Status Published Announcement",
            content: "Status filter content",
            status: "PUBLISHED",
        });

        const result = await listAnnouncements({
            page: 1,
            pageSize: 20,
            status: "PUBLISHED",
        });

        assert.ok(result.items.length >= 1);
        assert.ok(result.items.every((announcement) => announcement.status === "PUBLISHED"));
    });

    it("searches announcements by title", async () => {
        const announcement = await createTestAnnouncement({
            title: "Unique Database Search Title",
            content: "Normal announcement content",
        });

        const result = await listAnnouncements({
            page: 1,
            pageSize: 20,
            search: "Database Search",
        });

        assert.ok(result.items.some((item) => item.id === announcement.id));
    });

    it("searches announcements by content", async () => {
        const announcement = await createTestAnnouncement({
            title: "Normal Search Title",
            content: "Unique content keyword for testing",
        });

        const result = await listAnnouncements({
            page: 1,
            pageSize: 20,
            search: "content keyword",
        });

        assert.ok(result.items.some((item) => item.id === announcement.id));
    });

    it("returns only published announcements publicly", async () => {
        const published = await createTestAnnouncement({
            title: "Public Published Announcement",
            content: "Public content",
            status: "PUBLISHED",
        });

        const draft = await createTestAnnouncement({
            title: "Private Draft Announcement",
            content: "Private draft content",
            status: "DRAFT",
        });

        const archived = await createTestAnnouncement({
            title: "Private Archived Announcement",
            content: "Private archived content",
            status: "ARCHIVED",
        });

        const result = await listPublicAnnouncements({
            page: 1,
            pageSize: 100,
        });

        assert.ok(result.items.some((item) => item.id === published.id));
        assert.equal(
            result.items.some((item) => item.id === draft.id),
            false,
        );
        assert.equal(
            result.items.some((item) => item.id === archived.id),
            false,
        );

        assert.ok(
            result.items.every((announcement) => !("createdById" in announcement) && !("status" in announcement)),
        );
    });

    it("orders public announcements newest first", async () => {
        const olderDate = new Date("2026-01-01T00:00:00.000Z");
        const newerDate = new Date("2026-02-01T00:00:00.000Z");

        const older = await createTestAnnouncement({
            title: "Older Public Announcement",
            content: "Older content",
            status: "PUBLISHED",
            publishedAt: olderDate,
        });

        const newer = await createTestAnnouncement({
            title: "Newer Public Announcement",
            content: "Newer content",
            status: "PUBLISHED",
            publishedAt: newerDate,
        });

        const result = await listPublicAnnouncements({
            page: 1,
            pageSize: 100,
        });

        const olderIndex = result.items.findIndex((item) => item.id === older.id);
        const newerIndex = result.items.findIndex((item) => item.id === newer.id);

        assert.ok(olderIndex !== -1);
        assert.ok(newerIndex !== -1);
        assert.ok(newerIndex < olderIndex);
    });

    it("lists published announcements through the public action", async () => {
        const published = await createTestAnnouncement({
            title: "Public Action Announcement",
            content: "Public action content",
            status: "PUBLISHED",
        });

        const draft = await createTestAnnouncement({
            title: "Private Action Draft",
            content: "Private action content",
            status: "DRAFT",
        });

        const { listPublishedAnnouncements } = await import("@/actions/management/announcements");

        const result = await listPublishedAnnouncements({
            page: 1,
            pageSize: 100,
        });

        assert.equal(result.ok, true);

        if (!result.ok) return;

        assert.ok(result.data.items.some((item) => item.id === published.id));

        assert.equal(
            result.data.items.some((item) => item.id === draft.id),
            false,
        );
    });
});
