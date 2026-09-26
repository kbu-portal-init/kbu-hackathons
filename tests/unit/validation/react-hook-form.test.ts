import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

describe("react-hook-form server error mapping", () => {
    it("sets the first message per field and applies aliases", () => {
        const calls: [string, { type: string; message: string }][] = [];
        const setError = ((field: string, error: { type: string; message: string }) => {
            calls.push([field, error]);
        }) as never;

        applyActionFieldErrors({ teamName: ["Required"], "members.0.name": ["Invalid"] }, setError, {
            teamName: "name",
        });
        assert.deepEqual(calls, [
            ["name", { type: "server", message: "Required" }],
            ["members.0.name", { type: "server", message: "Invalid" }],
        ]);
    });

    it("ignores missing field errors", () => {
        let called = false;
        const setError = (() => {
            called = true;
        }) as never;
        applyActionFieldErrors(undefined, setError);
        assert.equal(called, false);
    });
});
