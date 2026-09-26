import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let getUserRole: typeof import("@/lib/auth/guards").getUserRole;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ getUserRole } = await import("@/lib/auth/guards"));
});

describe("authorization role guards", () => {
    it("accepts only supported roles", () => {
        assert.equal(getUserRole("team"), "team");
        assert.equal(getUserRole("organizer"), "organizer");
        assert.equal(getUserRole("admin"), "admin");
        assert.equal(getUserRole(undefined), null);
        assert.equal(getUserRole(null), null);
        assert.equal(getUserRole("unknown"), null);
    });
});
