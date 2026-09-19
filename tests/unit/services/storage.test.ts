import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

process.env.R2_ACCOUNT_ID = "test-account";
process.env.R2_ACCESS_KEY_ID = "test-access-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

async function main() {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

    const { DeleteObjectCommand, HeadObjectCommand } = await import("@aws-sdk/client-s3");
    const { deleteObject, generatePresignedUploadUrl, verifyUpload } = await import("@/lib/services/storage");
    const { r2 } = await import("@/lib/r2");
    assert.ok(r2, "Test R2 client should be configured");

    const originalSend = r2.send;
    const sentCommands: unknown[] = [];

    before(() => {
        r2.send = (async (command: unknown) => {
            sentCommands.push(command);
            return { ContentLength: 1024 };
        }) as typeof r2.send;
    });

    after(() => {
        r2.send = originalSend;
    });

    describe("storage service", () => {
        it("generates an event-image presigned URL in the event scope", async () => {
            const result = await generatePresignedUploadUrl(
                {
                    fileName: "banner.png",
                    fileType: "image/png",
                    fileSize: 1024,
                    category: "event-image",
                },
                "events",
            );

            assert.equal(result.ok, true);
            if (!result.ok) return;

            assert.match(result.data.key, /^uploads\/events\/[0-9a-f-]+\.png$/);
            assert.equal(result.data.publicUrl, `https://media.example.test/${result.data.key}`);
            assert.ok(result.data.presignedUrl.startsWith("https://"));
        });

        it("rejects finalization outside the owner scope", async () => {
            const result = await verifyUpload({ key: "uploads/other-team/file.png" }, "team-1");

            assert.equal(result.ok, false);
            if (result.ok) return;
            assert.equal(result.error.code, "FORBIDDEN");
            assert.equal(sentCommands.length, 0);
        });

        it("verifies an owned object and returns a normalized public URL", async () => {
            const result = await verifyUpload({ key: "uploads/events/banner.png" }, "events");

            assert.equal(result.ok, true);
            if (!result.ok) return;
            assert.equal(result.data.publicUrl, "https://media.example.test/uploads/events/banner.png");
            assert.ok(sentCommands.at(-1) instanceof HeadObjectCommand);
        });

        it("deletes only objects in the owner scope", async () => {
            const result = await deleteObject({ key: "uploads/events/banner.png" }, "events");

            assert.deepEqual(result, { ok: true, data: { ok: true } });
            assert.ok(sentCommands.at(-1) instanceof DeleteObjectCommand);

            const forbidden = await deleteObject({ key: "uploads/other-team/banner.png" }, "events");
            assert.equal(forbidden.ok, false);
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
