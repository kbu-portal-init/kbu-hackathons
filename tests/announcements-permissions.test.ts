import "dotenv/config";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

const serverOnlyPath = require.resolve("server-only");

require.cache[serverOnlyPath] = {
    exports: {},
} as NodeJS.Module;

const DENIED = "TEST_GUARD_DENIED";

let guardAllows = false;
let guardCalls = 0;
let guardUserId = "";

const guardsPath = require.resolve("../lib/auth/guards");

require.cache[guardsPath] = {
    id: guardsPath,
    filename: guardsPath,
    loaded: true,
    exports: {
        requireOrganizerOrAdmin: async () => {
            guardCalls += 1;

            if (!guardAllows) {
                throw new Error(DENIED);
            }

            return {
                user: {
                    id: guardUserId,
                    role: "admin",
                },
            };
        },
    },
} as unknown as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;
let actions: typeof import("@/actions/management/announcements");

let testUserId: string;
let draftId: string;

const draftTitle = `Permission Test Draft ${crypto.randomUUID()}`;

const managementActions = [
    "listAnnouncements",
    "getAnnouncement",
    "createAnnouncement",
    "updateAnnouncement",
    "publishAnnouncement",
    "archiveAnnouncement",
    "deleteAnnouncement",
] as const;

describe("announcement permissions", () => {
    before(async () => {
        prisma = (await import("@/lib/prisma")).default;
        actions = await import("@/actions/management/announcements");

        const now = new Date();

        const user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email: `announcement-permissions-${crypto.randomUUID()}@example.test`,
                name: "Announcement Permissions Test User",
                role: "admin",
                emailVerified: true,
                createdAt: now,
                updatedAt: now,
            },
        });

        testUserId = user.id;
        guardUserId = user.id;

        const draft = await prisma.announcement.create({
            data: {
                title: draftTitle,
                content: "Draft used by the permission tests",
                status: "DRAFT",
                createdById: testUserId,
            },
        });

        draftId = draft.id;
    });

    after(async () => {
        await prisma.auditLog.deleteMany({
            where: {
                actorId: testUserId,
            },
        });

        await prisma.announcement.deleteMany({
            where: {
                createdById: testUserId,
            },
        });

        await prisma.user.delete({
            where: {
                id: testUserId,
            },
        });

        await prisma.$disconnect();
    });

    for (const name of managementActions) {
        it(`${name} rejects callers without access before validating input`, async () => {
            guardAllows = false;

            await assert.rejects(() => actions[name]({}), {
                message: DENIED,
            });
        });
    }

    it("does not change any data when the guard rejects", async () => {
        guardAllows = false;

        const uniqueTitle = `Denied Create ${crypto.randomUUID()}`;

        await assert.rejects(
            () =>
                actions.createAnnouncement({
                    title: uniqueTitle,
                    content: "This must never be saved",
                }),
            { message: DENIED },
        );

        await assert.rejects(
            () =>
                actions.updateAnnouncement({
                    announcementId: draftId,
                    title: "Hijacked title",
                }),
            { message: DENIED },
        );

        await assert.rejects(() => actions.publishAnnouncement({ announcementId: draftId }), { message: DENIED });

        await assert.rejects(() => actions.deleteAnnouncement({ announcementId: draftId }), { message: DENIED });

        const created = await prisma.announcement.count({
            where: {
                title: uniqueTitle,
            },
        });

        assert.equal(created, 0);

        const unchanged = await prisma.announcement.findUnique({
            where: {
                id: draftId,
            },
        });

        assert.ok(unchanged);
        assert.equal(unchanged.title, draftTitle);
        assert.equal(unchanged.status, "DRAFT");
        assert.equal(unchanged.publishedAt, null);

        const auditRows = await prisma.auditLog.count({
            where: {
                targetType: "Announcement",
                targetId: draftId,
            },
        });

        assert.equal(auditRows, 0);
    });

    it("lets anyone read published announcements without calling the guard", async () => {
        guardAllows = false;

        const callsBefore = guardCalls;
        const result = await actions.listPublishedAnnouncements({});

        assert.equal(result.ok, true);
        assert.equal(guardCalls, callsBefore);
    });

    it("runs the action and records the session user when the guard allows access", async () => {
        guardAllows = true;

        const result = await actions.createAnnouncement({
            title: `Allowed Create ${crypto.randomUUID()}`,
            content: "Created by an allowed organizer",
        });

        guardAllows = false;

        assert.ok(result.ok);
        assert.equal(result.data.createdById, testUserId);
        assert.equal(result.data.status, "DRAFT");
    });
});
