import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

let access: "none" | "team" | "staff" | "admin" = "none";
let deleteResult: { ok: true; data: { ok: true } } | { ok: false; error: { message: string } } = {
    ok: true,
    data: { ok: true },
};
let deletedOwner: string | undefined;
let uploadedKey: string | undefined;

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

mock("@/lib/r2", {
    isR2Configured: () => true,
    R2_BUCKET: "bucket-test",
    R2_PUBLIC_URL: "https://cdn.example.test",
    r2: {
        send: async (command: { input: { Key: string } }) => {
            uploadedKey = command.input.Key;
            return {};
        },
    },
});

mock("@/lib/auth/guards", {
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

mock("@/lib/services/storage", {
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
    uploadedKey = undefined;
    deleteResult = { ok: true, data: { ok: true } };
});

function uploadRequest(file?: File, category?: string) {
    const body = new FormData();
    if (file) body.set("file", file);
    if (category) body.set("category", category);
    return new Request("https://example.test/api/upload/proxy", { method: "POST", body });
}

const TINY_PNG = new Uint8Array(
    Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
    ),
);

function tinyPng(): Uint8Array<ArrayBuffer> {
    return TINY_PNG;
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
        let response = await uploadPost(uploadRequest(submission, "submission") as never);
        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { error: "Unauthorized" });

        const png = new File([tinyPng()], "avatar.png", { type: "image/png" });
        for (const [category, allowed] of [
            ["admin-profile-image", "admin"],
            ["event-image", "staff"],
            ["announcement-image", "staff"],
            ["member-profile-image", "team"],
            ["image", "team"],
        ] as const) {
            access = allowed === "team" ? "staff" : "team";
            response = await uploadPost(uploadRequest(png, category) as never);
            assert.equal(response.status, 401, `${category} should reject role ${access}`);
        }
        assert.equal(uploadedKey, undefined);
    });

    it("derives the storage key from the session owner, never the client", async () => {
        const png = () => new File([tinyPng()], "avatar.png", { type: "image/png" });
        const pdf = new File(["data"], "project.pdf", { type: "application/pdf" });

        access = "team";
        let response = await uploadPost(uploadRequest(pdf, "submission") as never);
        assert.equal(response.status, 200);
        assert.match(String(uploadedKey), /^uploads\/team-1\/[0-9a-f-]+\.pdf$/);

        uploadedKey = undefined;
        response = await uploadPost(uploadRequest(png(), "member-profile-image") as never);
        assert.equal(response.status, 200);
        assert.match(String(uploadedKey), /^uploads\/team-1\/[0-9a-f-]+\.webp$/);

        uploadedKey = undefined;
        access = "staff";
        response = await uploadPost(uploadRequest(png(), "event-image") as never);
        assert.equal(response.status, 200);
        assert.match(String(uploadedKey), /^uploads\/events\/[0-9a-f-]+\.webp$/);

        uploadedKey = undefined;
        access = "admin";
        response = await uploadPost(uploadRequest(png(), "admin-profile-image") as never);
        assert.equal(response.status, 200);
        assert.match(String(uploadedKey), /^uploads\/admins\/admin-1\/[0-9a-f-]+\.webp$/);

        const body = (await response.json()) as { key: string; publicUrl: string };
        assert.equal(body.key, uploadedKey);
        assert.equal(body.publicUrl, `https://cdn.example.test/${uploadedKey}`);
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
