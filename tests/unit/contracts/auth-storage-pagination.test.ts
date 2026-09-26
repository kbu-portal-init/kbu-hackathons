import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deleteAuditLogSchema, listAuditLogsSchema } from "@/lib/contracts/audits";
import { passwordResetSchema, staffLoginSchema, teamLoginSchema } from "@/lib/contracts/auth";
import { deleteObjectSchema } from "@/lib/contracts/storage";
import { listTeamsSchema, teamIdSchema } from "@/lib/contracts/teams";
import { listUsersSchema } from "@/lib/contracts/users";

describe("auth contracts", () => {
    it("trims login identifiers and validates passwords", () => {
        assert.deepEqual(teamLoginSchema.parse({ username: " team-one ", password: "password123" }), {
            username: "team-one",
            password: "password123",
        });
        assert.equal(staffLoginSchema.safeParse({ email: "invalid", password: "password123" }).success, false);
        assert.equal(teamLoginSchema.safeParse({ username: "", password: "" }).success, false);
    });

    it("requires matching reset passwords", () => {
        assert.equal(
            passwordResetSchema.safeParse({ newPassword: "password123", confirmPassword: "password123" }).success,
            true,
        );
        assert.equal(
            passwordResetSchema.safeParse({ newPassword: "password123", confirmPassword: "different123" }).success,
            false,
        );
    });
});

describe("storage and list contracts", () => {
    it("accepts valid owned object keys and rejects empty keys", () => {
        assert.equal(deleteObjectSchema.safeParse({ key: "uploads/team-1/file.png" }).success, true);
        assert.equal(deleteObjectSchema.safeParse({ key: "" }).success, false);
    });

    it("applies pagination defaults and maximums", () => {
        assert.deepEqual(listTeamsSchema.parse({}), { page: 1, pageSize: 20 });
        assert.equal(listTeamsSchema.safeParse({ page: 0, pageSize: 101 }).success, false);
        assert.deepEqual(listUsersSchema.parse({}), { page: 1, pageSize: 200 });
        assert.deepEqual(listAuditLogsSchema.parse({}), { page: 1, pageSize: 20 });
    });

    it("requires entity identifiers", () => {
        assert.equal(teamIdSchema.safeParse({ teamId: "" }).success, false);
        assert.equal(deleteAuditLogSchema.safeParse({ id: "" }).success, false);
    });
});
