import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

let access: "none" | "team" | "staff" | "admin" = "none";
let deleteResult: { ok: true; data: { ok: true } } | { ok: false; error: { message: string } } = {
    ok: true,
    data: { ok: true },
};
let deletedOwner: string | undefined;

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

function mock(path: string, exports: object) {
    const filename = require.resolve(path);
    require.cache[filename] = { id: filename, filename, loaded: true, exports } as NodeJS.Module;
}

mock("../../../lib/auth/guards", {
    requireAdmin: async () => {
        if (access !== "admin") throw new Error("denied");
        return { user: { id: "admin-1" } };
    },
    requireOrganizerOrAdmin: async () => {
        if (access !== "staff" && access !== "admin") throw new Error("denied");
        return { user: { id: "staff-1" } };
    },
    requireApprovedTeam: async () => {
        if (access !== "team") throw new Error("denied");
        return { team: { id: "team-1" } };
    },
});

mock("../../../lib/services/storage", {
    deleteObject: async (_input: unknown, owner: string) => {
        deletedOwner = owner;
        return deleteResult;
    },
});

let uploadPost: typeof import("@/app/api/upload/proxy/route").POST;
let deletePost: typeof import("@/app/api/upload/delete/route").POST;

before(async () => {
    ({ POST: uploadPost } = await import("@/app/api/upload/proxy/route"));
    ({ POST: deletePost } = await import("@/app/api/upload/delete/route"));
});

beforeEach(() => {
    access = "none";
    deletedOwner = undefined;
    deleteResult = { ok: true, data: { ok: true } };
});

function uploadRequest(file?: File, category?: string) {
    const body = new FormData();
    if (file) body.set("file", file);
    if (category) body.set("category", category);
    return new Request("https://example.test/api/upload/proxy", { method: "POST", body });
}

describe("upload API routes", () => {
    it("rejects missing and unknown upload fields", async () => {
        let response = await uploadPost(uploadRequest() as never);
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { error: "Missing file or category" });

        response = await uploadPost(
            uploadRequest(new File(["data"], "file.txt", { type: "text/plain" }), "unknown") as never,
        );
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error, "Validation failed");
    });

    it("rejects disallowed MIME types and oversized files before authorization", async () => {
        let response = await uploadPost(
            uploadRequest(
                new File(["data"], "malware.exe", { type: "application/x-msdownload" }),
                "submission",
            ) as never,
        );
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { error: "File type not allowed" });

        const oversized = new File([new Uint8Array(6 * 1024 * 1024)], "large.png", { type: "image/png" });
        response = await uploadPost(uploadRequest(oversized, "image") as never);
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { error: "File too large" });
    });

    it("requires the role associated with each upload category", async () => {
        const submission = new File(["data"], "project.pdf", { type: "application/pdf" });
        const response = await uploadPost(uploadRequest(submission, "submission") as never);
        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { error: "Unauthorized" });
    });

    it("validates delete payloads and enforces key-prefix ownership", async () => {
        let response = await deletePost(
            new Request("https://example.test/api/upload/delete", {
                method: "POST",
                body: JSON.stringify({ key: "" }),
            }) as never,
        );
        assert.equal(response.status, 400);

        response = await deletePost(
            new Request("https://example.test/api/upload/delete", {
                method: "POST",
                body: JSON.stringify({ key: "uploads/team-1/file.png" }),
            }) as never,
        );
        assert.equal(response.status, 401);

        access = "team";
        response = await deletePost(
            new Request("https://example.test/api/upload/delete", {
                method: "POST",
                body: JSON.stringify({ key: "uploads/team-1/file.png" }),
            }) as never,
        );
        assert.equal(response.status, 200);
        assert.equal(deletedOwner, "team-1");
    });

    it("maps storage deletion failures to 500", async () => {
        access = "staff";
        deleteResult = { ok: false, error: { message: "Deletion failed" } };
        const response = await deletePost(
            new Request("https://example.test/api/upload/delete", {
                method: "POST",
                body: JSON.stringify({ key: "uploads/events/banner.png" }),
            }) as never,
        );
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { error: "Deletion failed" });
        assert.equal(deletedOwner, "events");
    });
});
