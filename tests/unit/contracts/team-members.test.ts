import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    createTeamMemberSchema,
    deleteTeamMemberSchema,
    generateMemberCardSchema,
    updateTeamMemberSchema,
} from "@/lib/contracts/team-members";

describe("member card contracts", () => {
    it("accepts a member identifier", () => {
        assert.deepEqual(generateMemberCardSchema.parse({ memberId: "member-1" }), { memberId: "member-1" });
    });

    it("rejects an empty or missing member identifier", () => {
        assert.equal(generateMemberCardSchema.safeParse({ memberId: "" }).success, false);
        assert.equal(generateMemberCardSchema.safeParse({}).success, false);
    });
});

describe("team member management contracts", () => {
    const validMember = {
        teamId: "team-1",
        name: "Test Student",
        studentEmail: "u123456789012@ms.kbu.ac.th",
        role: "DEVELOPER" as const,
    };

    it("accepts valid member creation data", () => {
        assert.deepEqual(createTeamMemberSchema.parse(validMember), validMember);
    });

    it("normalizes names and student emails", () => {
        const result = createTeamMemberSchema.parse({
            ...validMember,
            name: "  Test Student  ",
            studentEmail: " U123456789012@MS.KBU.AC.TH ",
        });

        assert.equal(result.name, "Test Student");
        assert.equal(result.studentEmail, "u123456789012@ms.kbu.ac.th");
    });

    it("rejects invalid student emails and roles", () => {
        assert.equal(
            createTeamMemberSchema.safeParse({
                ...validMember,
                studentEmail: "invalid@example.com",
            }).success,
            false,
        );

        assert.equal(
            createTeamMemberSchema.safeParse({
                ...validMember,
                role: "INVALID_ROLE",
            }).success,
            false,
        );
    });

    it("rejects invalid names", () => {
        for (const name of ["A", "A".repeat(101), "<script>", "Test\nStudent"]) {
            assert.equal(createTeamMemberSchema.safeParse({ ...validMember, name }).success, false);
        }
    });

    it("accepts valid member update data", () => {
        const result = updateTeamMemberSchema.safeParse({
            ...validMember,
            memberId: "member-1",
        });

        assert.equal(result.success, true);
    });

    it("requires team and member identifiers for deletion", () => {
        assert.equal(
            deleteTeamMemberSchema.safeParse({
                teamId: "team-1",
                memberId: "member-1",
            }).success,
            true,
        );

        assert.equal(deleteTeamMemberSchema.safeParse({ teamId: "team-1" }).success, false);
        assert.equal(deleteTeamMemberSchema.safeParse({ memberId: "member-1" }).success, false);
    });
});
