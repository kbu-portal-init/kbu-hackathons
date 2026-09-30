import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";

describe("shared contract foundations", () => {
    it("keeps pagination bounds ordered and positive", () => {
        assert.ok(DEFAULT_PAGE_SIZE > 0);
        assert.ok(MAX_PAGE_SIZE > DEFAULT_PAGE_SIZE);
    });

    it("maps every error code key to its own unique value", () => {
        const entries = Object.entries(ErrorCodes);
        assert.ok(entries.length > 0);
        for (const [key, value] of entries) {
            assert.equal(value, key);
        }
        assert.equal(new Set(entries.map(([, value]) => value)).size, entries.length);
    });
});
