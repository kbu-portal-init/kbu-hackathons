import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

let session: unknown;
let userQuery: unknown;
let announcementInput: unknown;

mock("next/headers", { headers: async () => new Headers() });
mock("@/lib/auth/config", { auth: { api: { getSession: async () => session } } });
mock("@/lib/data/users", {
    listUsers: async (input: unknown) => {
        userQuery = input;
        return { items: [], meta: { page: 1, pageSize: 20, total: 0, hasNextPage: false } };
    },
});
mock("@/actions/management/announcements", {
    listPublishedAnnouncements: async (input: unknown) => {
        announcementInput = input;
        return { ok: true, data: { items: [], meta: { page: 1, pageSize: 20, total: 0, hasNextPage: false } } };
    },
});

let adminUsersGet: typeof import("@/app/api/admin/users/route").GET;
let announcementsGet: typeof import("@/app/api/announcements/route").GET;

before(async () => {
    ({ GET: adminUsersGet } = await import("@/app/api/admin/users/route"));
    ({ GET: announcementsGet } = await import("@/app/api/announcements/route"));
});

beforeEach(() => {
    session = null;
    userQuery = undefined;
    announcementInput = undefined;
});

describe("application API routes", () => {
    it("requires an admin session for the user directory", async () => {
        let response = await adminUsersGet(new Request("https://example.test/api/admin/users"));
        assert.equal(response.status, 401);

        session = { user: { id: "organizer-1", role: "organizer" } };
        response = await adminUsersGet(new Request("https://example.test/api/admin/users"));
        assert.equal(response.status, 403);
        assert.equal(userQuery, undefined);
    });

    it("validates and forwards admin user-directory query parameters", async () => {
        session = { user: { id: "admin-1", role: "admin" } };
        let response = await adminUsersGet(new Request("https://example.test/api/admin/users?page=0"));
        assert.equal(response.status, 400);

        response = await adminUsersGet(
            new Request("https://example.test/api/admin/users?page=2&pageSize=50&search=leader"),
        );
        assert.equal(response.status, 200);
        assert.deepEqual(userQuery, { page: 2, pageSize: 50, search: "leader" });
    });

    it("forwards public announcement filters and returns action envelopes", async () => {
        const request = new Request("https://example.test/api/announcements?page=2&pageSize=10&search=launch");
        Object.defineProperty(request, "nextUrl", { value: new URL(request.url) });
        const response = await announcementsGet(request as never);
        assert.equal(response.status, 200);
        assert.deepEqual(announcementInput, { page: "2", pageSize: "10", search: "launch" });
        assert.equal((await response.json()).ok, true);
    });
});
