import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { toFieldErrors } from "@/lib/validation/zod";

describe("zod field error mapping", () => {
    it("groups issues by field path and deduplicates messages", () => {
        const schema = z.object({
            teamName: z.string().min(3, "Too short").max(2, "Too long"),
            members: z.array(z.object({ name: z.string().min(1, "Required") })),
        });
        const parsed = schema.safeParse({ teamName: "A", members: [{ name: "" }] });
        assert.equal(parsed.success, false);
        if (parsed.success) return;
        const errors = toFieldErrors(parsed.error);
        assert.deepEqual(errors, {
            teamName: ["Too short"],
            "members.0.name": ["Required"],
        });
    });

    it("falls back to the root key for pathless issues", () => {
        const parsed = z.string().safeParse(42);
        assert.equal(parsed.success, false);
        if (parsed.success) return;
        const errors = toFieldErrors(parsed.error);
        assert.deepEqual(Object.keys(errors), ["root"]);
        assert.equal(errors.root?.length, 1);
    });
});
