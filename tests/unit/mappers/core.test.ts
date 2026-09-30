import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toAuditLogListResult } from "@/lib/mappers/audits";
import { toEventSettingsDTO } from "@/lib/mappers/event-settings";
import { toOrganizerListResult } from "@/lib/mappers/organizers";
import { toRegistrationDetail } from "@/lib/mappers/registrations";

const date = new Date("2026-01-02T03:04:05.000Z");

describe("core DTO mappers", () => {
    it("serializes event dates to ISO strings", () => {
        const result = toEventSettingsDTO({
            id: 1,
            title: "Event",
            description: null,
            venue: null,
            imageUrls: [],
            promoUrl: null,
            registrationOpensAt: date,
            registrationClosesAt: date,
            startsAt: date,
            endsAt: date,
            submissionOpensAt: date,
            submissionDeadline: date,
            maxTeams: 10,
            minTeamSize: 2,
            maxTeamSize: 4,
            createdAt: date,
            updatedAt: date,
        });
        assert.equal(result.registrationOpensAt, date.toISOString());
        assert.equal(result.submissionDeadline, date.toISOString());
        assert.equal(result.createdAt, date.toISOString());
    });

    it("maps pagination metadata consistently", () => {
        const audits = toAuditLogListResult(
            [
                {
                    id: "a",
                    actor: null,
                    action: "TEST",
                    targetType: "User",
                    targetId: "u",
                    details: null,
                    createdAt: date,
                },
            ],
            { page: 2, pageSize: 10 },
            25,
        );
        assert.deepEqual(audits.meta, { total: 25, page: 2, pageSize: 10, hasNextPage: true });

        const organizers = toOrganizerListResult(
            [
                {
                    id: "o",
                    name: "Org",
                    email: "o@example.com",
                    createdAt: date,
                    banned: false,
                    banReason: null,
                    banExpires: null,
                },
            ],
            { page: 2, pageSize: 10 },
            20,
        );
        assert.equal(organizers.meta.hasNextPage, false);
        assert.equal(organizers.items[0]?.createdAt, date.toISOString());
    });

    it("serializes nullable registration detail dates", () => {
        const result = toRegistrationDetail({
            id: "r",
            status: "PENDING",
            submittedAt: null,
            createdAt: date,
            teamDisplayName: "Team",
            teamLoginName: "team",
            memberCount: 1,
            leaderName: "Leader",
            leaderEmail: "leader@example.com",
            applicationNotes: null,
            withdrawnAt: null,
            updatedAt: date,
            members: [{ id: "m", name: "Member", role: "LEADER", email: "m@example.com", verifiedAt: date }],
            reviews: [{ id: "v", decision: "APPROVED", reason: null, createdAt: date }],
        });
        assert.equal(result.submittedAt, null);
        assert.equal(result.members[0]?.verifiedAt, date.toISOString());
        assert.equal(result.reviews[0]?.createdAt, date.toISOString());
    });
});
