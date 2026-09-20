import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toAdminOverview } from "@/lib/mappers/admin";

describe("admin overview mapper", () => {
    it("maps all dashboard counts", () => {
        assert.deepEqual(
            toAdminOverview({
                organizerCount: 3,
                teamCount: 12,
                bannedAccountCount: 2,
                teamMemberCount: 40,
                registrationCount: 10,
                pendingRegistrationCount: 4,
                approvedRegistrationCount: 5,
                rejectedRegistrationCount: 1,
                submissionCount: 8,
                auditLogCount: 25,
                announcementCount: 6,
                pendingVerificationCount: 3,
            }),
            {
                organizerCount: 3,
                teamCount: 12,
                bannedAccountCount: 2,
                teamMemberCount: 40,
                registrationCount: 10,
                pendingRegistrationCount: 4,
                approvedRegistrationCount: 5,
                rejectedRegistrationCount: 1,
                submissionCount: 8,
                auditLogCount: 25,
                announcementCount: 6,
                pendingVerificationCount: 3,
            },
        );
    });
});
