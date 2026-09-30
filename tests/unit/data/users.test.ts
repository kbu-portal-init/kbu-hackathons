import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let users: typeof import("@/lib/data/users");

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    users = await import("@/lib/data/users");
});

describe("user directory queries", () => {
    it("computes pagination from the raw directory count", async () => {
        const originalQuery = prisma.$queryRaw;
        const calls: unknown[][] = [];
        try {
            prisma.$queryRaw = ((strings: TemplateStringsArray, ...values: unknown[]) => {
                calls.push([strings.join("?"), ...values]);
                if (calls.length === 1) return Promise.resolve([{ total: BigInt(500) }]);
                return Promise.resolve([{ id: "u1", name: "User", email: "u@example.com", kind: "user" }]);
            }) as unknown as typeof prisma.$queryRaw;
            const result = await users.listUsers({ page: 2, pageSize: 200 });
            assert.equal(result.meta.total, 500);
            assert.equal(result.meta.page, 2);
            assert.equal(result.meta.hasNextPage, true);
            assert.equal(result.items.length, 1);
        } finally {
            prisma.$queryRaw = originalQuery;
        }
    });

    it("interpolates the search pattern into both directory branches", async () => {
        const originalQuery = prisma.$queryRaw;
        const calls: unknown[][] = [];
        const flatten = (values: unknown[]): unknown[] =>
            values.flatMap((value) =>
                value && typeof value === "object" && "values" in (value as object)
                    ? (value as { values: unknown[] }).values
                    : [value],
            );
        try {
            prisma.$queryRaw = ((_strings: TemplateStringsArray, ...values: unknown[]) => {
                calls.push(values);
                return Promise.resolve(calls.length === 1 ? [{ total: BigInt(0) }] : []);
            }) as unknown as typeof prisma.$queryRaw;
            await users.listUsers({ page: 2, pageSize: 20, search: "  minh  " });
            const [countValues, itemValues] = calls.map(flatten);
            assert.equal(countValues?.filter((value) => value === "%minh%").length, 6);
            assert.ok(countValues?.includes("%minh%"));
            assert.ok(itemValues?.includes("%minh%"));
            assert.ok(itemValues?.includes(20));
            assert.ok(itemValues?.includes(20));

            calls.length = 0;
            await users.listUsers({ page: 1, pageSize: 20 });
            const [plainCount, plainItems] = calls.map(flatten);
            assert.equal(
                plainCount?.some((value) => typeof value === "string" && value.includes("%")),
                false,
            );
            assert.equal(
                plainItems?.some((value) => typeof value === "string" && value.includes("%")),
                false,
            );
            assert.ok(plainItems?.includes(0));
        } finally {
            prisma.$queryRaw = originalQuery;
        }
    });

    it("treats a missing count row as an empty page", async () => {
        const originalQuery = prisma.$queryRaw;
        try {
            prisma.$queryRaw = (async () => []) as unknown as typeof prisma.$queryRaw;
            const result = await users.listUsers({ page: 1, pageSize: 200 });
            assert.deepEqual(result.meta, { total: 0, page: 1, pageSize: 200, hasNextPage: false });
            assert.deepEqual(result.items, []);
        } finally {
            prisma.$queryRaw = originalQuery;
        }
    });
});
