import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toAdminOverview } from "@/lib/mappers/admin";

describe("admin overview mapper", () => {
    it("maps all dashboard counts", () => {
        assert.deepEqual(toAdminOverview({ organizerCount: 3, teamCount: 12, bannedAccountCount: 2 }), {
            organizerCount: 3,
            teamCount: 12,
            bannedAccountCount: 2,
        });
    });
});
