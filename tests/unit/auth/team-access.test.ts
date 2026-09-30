import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let findTeamAccountByUsername: typeof import("@/lib/auth/team-access").findTeamAccountByUsername;
let isApprovedTeamAccount: typeof import("@/lib/auth/team-access").isApprovedTeamAccount;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ findTeamAccountByUsername, isApprovedTeamAccount } = await import("@/lib/auth/team-access"));
});

describe("team access", () => {
    it("accepts only approved, active team accounts", () => {
        const team = { archivedAt: null, registration: { status: "APPROVED" } };
        assert.equal(isApprovedTeamAccount({ role: "team", team }), true);
        assert.equal(
            isApprovedTeamAccount({ role: "team", team: { ...team, registration: { status: "PENDING" } } }),
            false,
        );
        assert.equal(
            isApprovedTeamAccount({ role: "team", team: { ...team, registration: { status: "REJECTED" } } }),
            false,
        );
        assert.equal(isApprovedTeamAccount({ role: "team", team: { ...team, archivedAt: new Date() } }), false);
        assert.equal(isApprovedTeamAccount({ role: "team", team: { ...team, registration: null } }), false);
        assert.equal(isApprovedTeamAccount({ role: "team", team: null }), false);
        assert.equal(isApprovedTeamAccount({ role: "organizer", team }), false);
        assert.equal(isApprovedTeamAccount(null), false);
    });

    it("normalizes username lookup input", async () => {
        const originalFindFirst = prisma.user.findFirst;
        let receivedUsername: string | undefined;
        prisma.user.findFirst = (async ({ where }: { where: { username: string } }) => {
            receivedUsername = where.username;
            return null;
        }) as unknown as typeof prisma.user.findFirst;
        try {
            await findTeamAccountByUsername("Team-Alpha");
            assert.equal(receivedUsername, "team-alpha");
        } finally {
            prisma.user.findFirst = originalFindFirst;
        }
    });
});
