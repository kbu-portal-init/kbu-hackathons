import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { banAccountSchema, unbanAccountSchema } from "@/lib/contracts/accounts";

describe("account administration contracts", () => {
    it("accepts a ban with a future expiry", () => {
        const result = banAccountSchema.safeParse({
            userId: "user-1",
            reason: "Policy violation",
            expiresAt: "2099-01-01",
        });
        assert.equal(result.success, true);
    });
    it("accepts an indefinite ban and unban input", () => {
        assert.deepEqual(banAccountSchema.parse({ userId: "user-1", reason: "Policy violation" }), {
            userId: "user-1",
            reason: "Policy violation",
        });
        assert.deepEqual(unbanAccountSchema.parse({ userId: "user-1" }), { userId: "user-1" });
    });
    it("rejects invalid ban fields and past expiry dates", () => {
        assert.equal(banAccountSchema.safeParse({ userId: "", reason: "" }).success, false);
        assert.equal(banAccountSchema.safeParse({ userId: "user-1", reason: "x".repeat(501) }).success, false);
        assert.equal(
            banAccountSchema.safeParse({ userId: "user-1", reason: "Reason", expiresAt: "2000-01-01" }).success,
            false,
        );
        assert.equal(unbanAccountSchema.safeParse({ userId: "" }).success, false);
    });
});
