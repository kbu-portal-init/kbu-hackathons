import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

const toasts: [string, string][] = [];
mock("sonner", {
    toast: {
        error: (message: string) => toasts.push(["error", message]),
    },
});

let handleActionError: typeof import("@/lib/utils/action-error").handleActionError;

before(async () => {
    ({ handleActionError } = await import("@/lib/utils/action-error"));
});

describe("action error handler", () => {
    it("logs the error, toasts the message, and returns false", () => {
        toasts.length = 0;
        const logged: unknown[] = [];
        const originalError = console.error;
        console.error = (...args: unknown[]) => logged.push(args[0]);
        try {
            const result = handleActionError(new Error("boom"), "Save failed");
            assert.equal(result, false);
        } finally {
            console.error = originalError;
        }
        assert.equal((logged[0] as Error).message, "boom");
        assert.deepEqual(toasts, [["error", "Save failed"]]);
    });
});
