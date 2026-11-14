import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

process.env.R2_ENDPOINT = "https://test-account.r2.cloudflarestorage.com";
process.env.R2_ACCESS_KEY_ID = "test-access-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.test/";

const cases = [
    ["uploads/team-1/avatar.webp", "team-1", true],
    ["uploads/team-10/avatar.webp", "team-1", false],
    ["uploads/team-2/avatar.webp", "team-1", false],
    ["uploads/team-1/nested/avatar.webp", "team-1", true],
    ["uploads/team-1", "team-1", false],
] as const;

async function main() {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const { deleteObject } = await import("@/lib/services/storage");
    const { isOwnedR2PublicUrl, r2 } = await import("@/lib/r2");

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
        it("deletes only objects in the owner scope", async () => {
            for (const [key, owner, allowed] of cases) {
                const commandCountBefore = sentCommands.length;
                const result = await deleteObject({ key }, owner);

                assert.equal(result.ok, allowed, `Unexpected result for key "${key}" and owner "${owner}"`);

                assert.equal(
                    sentCommands.length - commandCountBefore,
                    allowed ? 1 : 0,
                    `Unexpected R2 command count for key "${key}"`,
                );

                if (allowed) {
                    assert.ok(sentCommands.at(-1) instanceof DeleteObjectCommand);
                }
            }
        });

        it("validates R2 public URL ownership", () => {
            assert.equal(
                isOwnedR2PublicUrl("https://media.example.test/uploads/team-1/avatar.webp", "uploads/team-1"),
                true,
            );

            assert.equal(
                isOwnedR2PublicUrl("https://media.example.test/uploads/team-2/avatar.webp", "uploads/team-1"),
                false,
            );

            assert.equal(
                isOwnedR2PublicUrl("https://other.example.test/uploads/team-1/avatar.webp", "uploads/team-1"),
                false,
            );

            assert.equal(
                isOwnedR2PublicUrl("https://media.example.test/uploads/team-10/avatar.webp", "uploads/team-1"),
                false,
            );
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
