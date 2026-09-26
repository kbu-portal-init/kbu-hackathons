import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let POST: typeof import("@/app/api/password-reset/request/route").POST;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ POST } = await import("@/app/api/password-reset/request/route"));
});

describe("password reset request route", () => {
    it("rejects requests without exactly one identifier", async () => {
        const response = await POST(
            new Request("http://localhost/api/password-reset/request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({}),
            }),
        );

        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: "Invalid password-reset request" });
    });

    it("rejects requests that provide both identifiers", async () => {
        const response = await POST(
            new Request("http://localhost/api/password-reset/request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: "staff@example.com", username: "team-alpha" }),
            }),
        );

        assert.equal(response.status, 400);
    });
});
