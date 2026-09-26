import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

const REDIRECT = "TEST_REDIRECT";
let redirectTarget: string | undefined;
let session: unknown;

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

const configPath = require.resolve("../../../lib/auth/config");
require.cache[configPath] = {
    id: configPath,
    filename: configPath,
    loaded: true,
    exports: { auth: { api: { getSession: async () => session } } },
} as NodeJS.Module;

const headersPath = require.resolve("next/headers");
require.cache[headersPath] = {
    id: headersPath,
    filename: headersPath,
    loaded: true,
    exports: { headers: async () => new Headers() },
} as NodeJS.Module;

const navigationPath = require.resolve("next/navigation");
require.cache[navigationPath] = {
    id: navigationPath,
    filename: navigationPath,
    loaded: true,
    exports: {
        redirect: (target: string) => {
            redirectTarget = target;
            throw new Error(REDIRECT);
        },
    },
} as NodeJS.Module;

const reactPath = require.resolve("react");
const react = require(reactPath);
require.cache[reactPath] = {
    id: reactPath,
    filename: reactPath,
    loaded: true,
    exports: { ...react, cache: <T extends (...args: never[]) => unknown>(callback: T) => callback },
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;
let guards: typeof import("@/lib/auth/guards");

const userSession = (role: "team" | "organizer" | "admin", overrides: Record<string, unknown> = {}) => ({
    user: { id: `${role}-1`, role, banned: false, banExpires: null, ...overrides },
    session: { id: "session-1" },
});

async function expectRedirect(run: () => Promise<unknown>, target = "/login") {
    await assert.rejects(run, { message: REDIRECT });
    assert.equal(redirectTarget, target);
}

before(async () => {
    ({ default: prisma } = await import("@/lib/prisma"));
    guards = await import("@/lib/auth/guards");
});

beforeEach(() => {
    session = null;
    redirectTarget = undefined;
});

describe("authorization guards", () => {
    it("accepts only supported roles", () => {
        assert.equal(guards.getUserRole("team"), "team");
        assert.equal(guards.getUserRole("organizer"), "organizer");
        assert.equal(guards.getUserRole("admin"), "admin");
        assert.equal(guards.getUserRole(undefined), null);
        assert.equal(guards.getUserRole(null), null);
        assert.equal(guards.getUserRole("unknown"), null);
    });

    it("requires an authenticated, non-actively-banned user", async () => {
        await expectRedirect(() => guards.requireAuth());
        session = userSession("team", { banned: true, banExpires: null });
        await expectRedirect(() => guards.requireAuth());
        session = userSession("team", { banned: true, banExpires: new Date(Date.now() + 60_000) });
        await expectRedirect(() => guards.requireAuth());
        session = userSession("team", { banned: true, banExpires: new Date(Date.now() - 60_000) });
        assert.equal(await guards.requireAuth(), session);
    });

    it("enforces organizer and admin roles", async () => {
        session = userSession("team");
        await expectRedirect(() => guards.requireOrganizerOrAdmin());
        session = userSession("organizer");
        assert.equal(await guards.requireOrganizerOrAdmin(), session);
        await expectRedirect(() => guards.requireAdmin());
        session = userSession("admin");
        assert.equal(await guards.requireOrganizerOrAdmin(), session);
        assert.equal(await guards.requireAdmin(), session);
    });

    it("requires an active team linked to a team session", async () => {
        const originalFindUnique = prisma.team.findUnique;
        try {
            session = userSession("organizer");
            await expectRedirect(() => guards.requireTeamSession());
            session = userSession("team");
            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;
            await expectRedirect(() => guards.requireTeamSession());
            prisma.team.findUnique = (async () => ({
                id: "team-1",
                archivedAt: new Date(),
                registration: { status: "APPROVED" },
            })) as unknown as typeof prisma.team.findUnique;
            await expectRedirect(() => guards.requireTeamSession());
            const team = { id: "team-1", archivedAt: null, registration: { status: "APPROVED" } };
            prisma.team.findUnique = (async () => team) as unknown as typeof prisma.team.findUnique;
            assert.equal((await guards.requireTeamSession()).team, team);
        } finally {
            prisma.team.findUnique = originalFindUnique;
        }
    });

    it("requires approved registration for participant access", async () => {
        const originalFindUnique = prisma.team.findUnique;
        try {
            session = userSession("team");
            for (const status of [undefined, "PENDING", "REJECTED"] as const) {
                prisma.team.findUnique = (async () => ({
                    id: "team-1",
                    archivedAt: null,
                    registration: status ? { status } : null,
                })) as unknown as typeof prisma.team.findUnique;
                await expectRedirect(() => guards.requireApprovedTeam());
            }
            prisma.team.findUnique = (async () => ({
                id: "team-1",
                archivedAt: null,
                registration: { status: "APPROVED" },
            })) as unknown as typeof prisma.team.findUnique;
            assert.equal((await guards.requireApprovedTeam()).team.id, "team-1");
        } finally {
            prisma.team.findUnique = originalFindUnique;
        }
    });

    it("redirects authenticated users only to an authorized workspace", async () => {
        const originalFindUnique = prisma.team.findUnique;
        try {
            session = userSession("organizer");
            await expectRedirect(() => guards.redirectAuthenticatedUser(), "/panel");
            session = userSession("admin");
            await expectRedirect(() => guards.redirectAuthenticatedUser(), "/admin");
            session = userSession("team");
            prisma.team.findUnique = (async () => ({
                archivedAt: null,
                registration: { status: "APPROVED" },
            })) as unknown as typeof prisma.team.findUnique;
            await expectRedirect(() => guards.redirectAuthenticatedUser(), "/team");
            for (const team of [
                null,
                { archivedAt: new Date(), registration: { status: "APPROVED" } },
                { archivedAt: null, registration: { status: "PENDING" } },
            ]) {
                redirectTarget = undefined;
                prisma.team.findUnique = (async () => team) as unknown as typeof prisma.team.findUnique;
                await guards.redirectAuthenticatedUser();
                assert.equal(redirectTarget, undefined);
            }
        } finally {
            prisma.team.findUnique = originalFindUnique;
        }
    });

    it("redirects existing sessions away from anonymous-only pages", async () => {
        await guards.redirectHomeIfAlreadyAuthenticated();
        assert.equal(redirectTarget, undefined);
        session = userSession("team");
        await expectRedirect(() => guards.redirectHomeIfAlreadyAuthenticated(), "/");
    });
});
