import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateMemberCardSchema } from "@/lib/contracts/team-members";

describe("member card contracts", () => {
    it("accepts a member identifier", () => {
        assert.deepEqual(generateMemberCardSchema.parse({ memberId: "member-1" }), { memberId: "member-1" });
    });

    it("rejects an empty or missing member identifier", () => {
        assert.equal(generateMemberCardSchema.safeParse({ memberId: "" }).success, false);
        assert.equal(generateMemberCardSchema.safeParse({}).success, false);
    });
});
