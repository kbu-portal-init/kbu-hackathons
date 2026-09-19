import assert from "node:assert/strict";
import type { ActionResult, ListResult } from "@/lib/contracts/common";

export function assertActionSuccess<T>(result: ActionResult<T>): asserts result is { ok: true; data: T } {
    assert.equal(result.ok, true);
}
export function assertActionFailure<T>(
    result: ActionResult<T>,
): asserts result is { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } } {
    assert.equal(result.ok, false);
}
export function assertListResult<T>(result: ListResult<T>, expectedCount?: number): void {
    assert.ok(Array.isArray(result.items));
    assert.equal(result.items.length, expectedCount ?? result.items.length);
    assert.ok(result.meta.page >= 1);
    assert.ok(result.meta.pageSize >= 1);
    assert.ok(result.meta.total >= result.items.length);
}
