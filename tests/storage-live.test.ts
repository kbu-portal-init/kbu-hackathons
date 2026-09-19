import "dotenv/config";

import assert from "node:assert/strict";

const TEST_OWNER = "tests";
const TEST_FILE = Buffer.from("kbu-r2-storage-integration-test\n", "utf8");

function requireOptIn() {
    if (process.env.RUN_R2_INTEGRATION_TESTS !== "true") {
        throw new Error("Live R2 tests are disabled. Run with RUN_R2_INTEGRATION_TESTS=true pnpm test:storage:live.");
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("Live R2 tests cannot run with NODE_ENV=production.");
    }
}

function requireStorageEnvironment() {
    const required = [
        "R2_ENDPOINT",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_BUCKET_NAME",
        "NEXT_PUBLIC_R2_PUBLIC_URL",
    ] as const;
    const missing = required.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        throw new Error(`Live R2 tests require: ${missing.join(", ")}`);
    }
}

async function main() {
    requireOptIn();
    requireStorageEnvironment();

    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

    const { deleteObject, generatePresignedUploadUrl, verifyUpload } = await import("@/lib/services/storage");

    let key: string | undefined;

    try {
        const presigned = await generatePresignedUploadUrl(
            {
                fileName: "storage-test.txt",
                fileType: "text/plain",
                fileSize: TEST_FILE.byteLength,
                category: "submission",
            },
            TEST_OWNER,
        );

        if (!presigned.ok) throw new Error(`Presigning failed: ${presigned.error.message}`);

        key = presigned.data.key;
        assert.match(key, /^uploads\/tests\/[0-9a-f-]+\.txt$/);
        assert.ok(presigned.data.publicUrl.startsWith(`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/`));

        let uploadResponse: Response;
        try {
            uploadResponse = await fetch(presigned.data.presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Length": String(TEST_FILE.byteLength),
                    "Content-Type": "text/plain",
                },
                body: TEST_FILE,
            });
        } catch (error) {
            throw new Error(
                `R2 upload request failed before receiving a response: ${error instanceof Error ? error.message : "unknown network error"}`,
            );
        }
        if (!uploadResponse.ok) {
            const responseBody = await uploadResponse.text();
            throw new Error(`R2 upload failed with status ${uploadResponse.status}: ${responseBody}`);
        }

        const verified = await verifyUpload({ key }, TEST_OWNER);
        if (!verified.ok) throw new Error(`R2 verification failed: ${verified.error.message}`);
        assert.equal(verified.data.publicUrl, presigned.data.publicUrl);

        console.log("Live R2 storage test passed.");
    } finally {
        if (key) {
            const deleted = await deleteObject({ key }, TEST_OWNER);
            if (!deleted.ok) {
                console.error(`R2 cleanup failed: ${deleted.error.message}`);
                process.exitCode = 1;
            }
        }
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Live R2 storage test failed.");
    process.exitCode = 1;
});
