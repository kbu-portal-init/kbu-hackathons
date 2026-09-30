import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapAnnouncementToDTO, mapAnnouncementToPublicDTO } from "@/lib/mappers/announcements";
import { toTeamDetail, toTeamListItem } from "@/lib/mappers/teams";

const date = new Date("2026-01-02T03:04:05.000Z");
const expiredBan = new Date("2020-01-01T00:00:00.000Z");
const activeBan = new Date("2099-01-01T00:00:00.000Z");

function listRecord() {
    return {
        id: "team-1",
        userId: "user-1",
        displayName: "Build Team",
        loginName: "build-team",
        imageUrl: null,
        createdAt: date,
        user: { banned: true, banReason: "spam", banExpires: activeBan },
        members: [{ id: "m1" }, { id: "m2" }],
        submission: { id: "s1" },
        registration: { status: "APPROVED" },
    };
}

describe("supporting DTO mappers", () => {
    it("derives team list counts, status defaults, and active bans", () => {
        const item = toTeamListItem(listRecord());
        assert.equal(item.memberCount, 2);
        assert.equal(item.submissionCount, 1);
        assert.equal(item.registrationStatus, "APPROVED");
        assert.equal(item.banned, true);
        assert.equal(item.banExpires, activeBan.toISOString());
        assert.equal(item.createdAt, date.toISOString());

        const unknown = toTeamListItem({
            ...listRecord(),
            user: null,
            submission: null,
            registration: null,
        });
        assert.equal(unknown.registrationStatus, "UNKNOWN");
        assert.equal(unknown.submissionCount, 0);
        assert.equal(unknown.banned, false);

        const expired = toTeamListItem({
            ...listRecord(),
            user: { banned: true, banReason: "spam", banExpires: expiredBan },
        });
        assert.equal(expired.banned, false);
    });

    it("serializes team detail members, reviews, and submission dates", () => {
        const detail = toTeamDetail({
            ...listRecord(),
            updatedAt: date,
            registration: {
                status: "APPROVED",
                submittedAt: date,
                applicationNotes: null,
                withdrawnAt: null,
                reviews: [{ id: "v1", decision: "APPROVED", reason: null, createdAt: date }],
            },
            members: [
                {
                    id: "m1",
                    name: "Member",
                    studentEmail: "m@example.com",
                    role: "DEVELOPER",
                    imageUrl: null,
                    studentEmailVerifiedAt: date,
                },
            ],
            submission: {
                id: "s1",
                title: "Demo",
                description: null,
                repositoryUrl: null,
                demoUrl: null,
                presentationUrl: null,
                submittedAt: date,
                createdAt: date,
                updatedAt: date,
            },
        });
        assert.equal(detail.updatedAt, date.toISOString());
        assert.equal(detail.submittedAt, date.toISOString());
        assert.equal(detail.members[0]?.email, "m@example.com");
        assert.equal(detail.members[0]?.verifiedAt, date.toISOString());
        assert.equal(detail.reviews[0]?.createdAt, date.toISOString());
        assert.equal(detail.submission?.submittedAt, date.toISOString());

        const empty = toTeamDetail({
            ...listRecord(),
            updatedAt: date,
            registration: null,
            members: [],
            submission: null,
        });
        assert.equal(empty.submittedAt, null);
        assert.deepEqual(empty.reviews, []);
        assert.equal(empty.submission, null);
    });

    it("maps announcements with and without published dates", () => {
        const draft = mapAnnouncementToDTO({
            id: "a1",
            title: "Title",
            content: "Content",
            imageUrl: null,
            status: "DRAFT",
            publishedAt: null,
            createdById: "admin-1",
            createdAt: date,
            updatedAt: date,
        } as never);
        assert.equal(draft.publishedAt, null);
        assert.equal(draft.status, "DRAFT");
        assert.equal(draft.createdAt, date.toISOString());

        const published = mapAnnouncementToPublicDTO({
            id: "a2",
            title: "Title",
            content: "Content",
            imageUrl: null,
            status: "PUBLISHED",
            publishedAt: date,
            createdById: "admin-1",
            createdAt: date,
            updatedAt: date,
        } as never);
        assert.equal(published.publishedAt, date.toISOString());
        assert.equal("createdById" in published, false);
    });
});
