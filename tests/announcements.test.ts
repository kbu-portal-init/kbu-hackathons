import "dotenv/config";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { AnnouncementStatus } from "@/lib/contracts/announcements";

const serverOnlyPath = require.resolve("server-only");

require.cache[serverOnlyPath] = {
    exports: {},
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;

let createAnnouncement: typeof import("@/lib/services/announcements").createAnnouncement;
let updateAnnouncement: typeof import("@/lib/services/announcements").updateAnnouncement;
let publishAnnouncement: typeof import("@/lib/services/announcements").publishAnnouncement;
let archiveAnnouncement: typeof import("@/lib/services/announcements").archiveAnnouncement;
let deleteAnnouncement: typeof import("@/lib/services/announcements").deleteAnnouncement;

async function loadDependencies() {
    prisma = (await import("@/lib/prisma")).default;

    const service = await import("@/lib/services/announcements");

    createAnnouncement = service.createAnnouncement;
    updateAnnouncement = service.updateAnnouncement;
    publishAnnouncement = service.publishAnnouncement;
    archiveAnnouncement = service.archiveAnnouncement;
    deleteAnnouncement = service.deleteAnnouncement;
}

let testUserId: string;

const createdAnnouncementIds: string[] = [];
const now = new Date();

async function createTestUser() {
    const user = await prisma.user.create({
        data: {
            id: crypto.randomUUID(),
            email: `announcement-test-${Date.now()}@example.test`,
            name: "Announcement Test User",
            role: "admin",
            emailVerified: true,
            createdAt: now,
            updatedAt: now,
        },
    });

    testUserId = user.id;
}

async function createTestAnnouncement(status: AnnouncementStatus = "DRAFT") {
    const announcement = await prisma.announcement.create({
        data: {
            title: `Test Announcement ${Date.now()}`,
            content: "Test announcement content",
            status,
            publishedAt: status === "PUBLISHED" ? new Date() : null,
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
        await prisma.auditLog.deleteMany({
            where: {
                targetType: "Announcement",
                targetId: {
                    in: createdAnnouncementIds,
                },
            },
        });

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

describe("announcement service", () => {
    it("creates a new announcement as DRAFT", async () => {
        const result = await createAnnouncement(
            {
                title: "New Test Announcement",
                content: "This is test content.",
                imageUrl: "",
            },
            testUserId,
        );

        assert.equal(result.ok, true);
        if (!result.ok) return;

        assert.equal(result.data.status, "DRAFT");
        assert.equal(result.data.title, "New Test Announcement");
        assert.equal(result.data.content, "This is test content.");
        assert.equal(result.data.imageUrl, null);

        createdAnnouncementIds.push(result.data.id);

        const audit = await prisma.auditLog.findFirst({
            where: {
                action: "ANNOUNCEMENT_CREATED",
                targetId: result.data.id,
            },
        });

        assert.ok(audit);
        assert.equal(audit.targetType, "Announcement");
        assert.equal(audit.actorId, testUserId);
    });

    it("updates an announcement", async () => {
        const announcement = await createTestAnnouncement();

        const result = await updateAnnouncement(
            {
                announcementId: announcement.id,
                title: "Updated Announcement",
                content: "Updated content",
            },
            testUserId,
        );

        assert.equal(result.ok, true);
        if (!result.ok) return;

        assert.equal(result.data.title, "Updated Announcement");
        assert.equal(result.data.content, "Updated content");
        assert.equal(result.data.status, "DRAFT");

        const audit = await prisma.auditLog.findFirst({
            where: {
                action: "ANNOUNCEMENT_UPDATED",
                targetId: announcement.id,
            },
        });

        assert.ok(audit);
    });

    it("publishes a DRAFT announcement", async () => {
        const announcement = await createTestAnnouncement("DRAFT");

        const result = await publishAnnouncement(
            {
                announcementId: announcement.id,
            },
            testUserId,
        );

        assert.equal(result.ok, true);
        if (!result.ok) return;

        assert.equal(result.data.status, "PUBLISHED");
        assert.ok(result.data.publishedAt);

        const audit = await prisma.auditLog.findFirst({
            where: {
                action: "ANNOUNCEMENT_PUBLISHED",
                targetId: announcement.id,
            },
        });

        assert.ok(audit);
    });

    it("archives a PUBLISHED announcement", async () => {
        const announcement = await createTestAnnouncement("PUBLISHED");

        const result = await archiveAnnouncement(
            {
                announcementId: announcement.id,
            },
            testUserId,
        );

        assert.equal(result.ok, true);
        if (!result.ok) return;

        assert.equal(result.data.status, "ARCHIVED");

        const audit = await prisma.auditLog.findFirst({
            where: {
                action: "ANNOUNCEMENT_ARCHIVED",
                targetId: announcement.id,
            },
        });

        assert.ok(audit);
    });

    it("deletes a DRAFT announcement", async () => {
        const announcement = await createTestAnnouncement("DRAFT");

        const result = await deleteAnnouncement(
            {
                announcementId: announcement.id,
            },
            testUserId,
        );

        assert.equal(result.ok, true);
        if (!result.ok) return;

        assert.equal(result.data.id, announcement.id);

        const deleted = await prisma.announcement.findUnique({
            where: {
                id: announcement.id,
            },
        });

        assert.equal(deleted, null);

        const audit = await prisma.auditLog.findFirst({
            where: {
                action: "ANNOUNCEMENT_DELETED",
                targetId: announcement.id,
            },
        });

        assert.ok(audit);
    });

    it("rejects deleting a PUBLISHED announcement", async () => {
        const announcement = await createTestAnnouncement("PUBLISHED");

        const result = await deleteAnnouncement(
            {
                announcementId: announcement.id,
            },
            testUserId,
        );

        assert.equal(result.ok, false);

        if (result.ok) return;

        assert.equal(result.error.code, "ANNOUNCEMENT_INVALID_TRANSITION");
    });

    it("rejects publishing an ARCHIVED announcement", async () => {
        const announcement = await createTestAnnouncement("ARCHIVED");

        const result = await publishAnnouncement(
            {
                announcementId: announcement.id,
            },
            testUserId,
        );

        assert.equal(result.ok, false);

        if (result.ok) return;

        assert.equal(result.error.code, "ANNOUNCEMENT_INVALID_TRANSITION");
    });

    it("rejects archiving a DRAFT announcement", async () => {
        const announcement = await createTestAnnouncement("DRAFT");

        const result = await archiveAnnouncement(
            {
                announcementId: announcement.id,
            },
            testUserId,
        );

        assert.equal(result.ok, false);

        if (result.ok) return;

        assert.equal(result.error.code, "ANNOUNCEMENT_INVALID_TRANSITION");
    });

    it("returns not found for a missing announcement", async () => {
        const result = await publishAnnouncement(
            {
                announcementId: "non-existent-announcement-id",
            },
            testUserId,
        );

        assert.equal(result.ok, false);

        if (result.ok) return;

        assert.equal(result.error.code, "ANNOUNCEMENT_NOT_FOUND");
    });

    it("allows only one of two concurrent publishes to succeed", async () => {
        const announcement = await createTestAnnouncement("DRAFT");

        const results = await Promise.all([
            publishAnnouncement({ announcementId: announcement.id }, testUserId),
            publishAnnouncement({ announcementId: announcement.id }, testUserId),
        ]);

        assert.equal(results.filter((result) => result.ok).length, 1);

        const failure = results.find((result) => !result.ok);

        assert.ok(failure && !failure.ok);
        assert.equal(failure.error.code, "ANNOUNCEMENT_INVALID_TRANSITION");

        const auditCount = await prisma.auditLog.count({
            where: {
                action: "ANNOUNCEMENT_PUBLISHED",
                targetType: "Announcement",
                targetId: announcement.id,
            },
        });

        assert.equal(auditCount, 1);
    });
});
