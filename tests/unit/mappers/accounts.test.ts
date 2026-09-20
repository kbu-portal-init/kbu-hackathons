import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toAccountActionData } from "@/lib/mappers/accounts";

describe("account action mapper", () => {
    it("maps a persistence ID to the public action DTO", () => {
        assert.deepEqual(toAccountActionData({ id: "user-1" }), { userId: "user-1" });
    });
});
