import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    createOrganizerSchema,
    listOrganizersSchema,
    organizerIdSchema,
    updateOrganizerSchema,
} from "@/lib/contracts/organizers";

describe("organizer administration contracts", () => {
    it("validates organizer creation and update inputs", () => {
        assert.equal(
            createOrganizerSchema.safeParse({ name: "Organizer", email: "org@example.com", password: "password123" })
                .success,
            true,
        );
        assert.equal(updateOrganizerSchema.safeParse({ userId: "user-1", name: "Updated" }).success, true);
        assert.equal(organizerIdSchema.safeParse({ userId: "user-1" }).success, true);
    });
    it("applies pagination defaults", () => {
        assert.deepEqual(listOrganizersSchema.parse({}), { page: 1, pageSize: 20 });
    });
    it("rejects invalid organizer and pagination inputs", () => {
        assert.equal(createOrganizerSchema.safeParse({ name: "", email: "bad", password: "short" }).success, false);
        assert.equal(updateOrganizerSchema.safeParse({ userId: "user-1", password: "short" }).success, false);
        assert.equal(organizerIdSchema.safeParse({ userId: "" }).success, false);
        assert.equal(listOrganizersSchema.safeParse({ page: 0 }).success, false);
        assert.equal(listOrganizersSchema.safeParse({ pageSize: 101 }).success, false);
    });
});
