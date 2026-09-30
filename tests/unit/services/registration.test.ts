import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let submitRegistration: typeof import("@/lib/services/registration").submitRegistration;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ submitRegistration } = await import("@/lib/services/registration"));
});

const validEvent = {
    registrationOpensAt: new Date("2020-01-01T00:00:00.000Z"),
    registrationClosesAt: new Date("2099-01-01T00:00:00.000Z"),
    minTeamSize: 2,
    maxTeamSize: 4,
    maxTeams: 10,
};

const validInput = {
    teamName: "Build Team",
    leaderName: "Leader",
    leaderEmail: "leader@example.com",
    leaderRole: "LEADER" as const,
    members: [{ name: "Member", email: "member@example.com", role: "DESIGNER" as const }],
};

describe("registration submission guards", () => {
    it("rejects when event settings are missing", async () => {
        const originalFind = prisma.eventSettings.findUnique;
        prisma.eventSettings.findUnique = (async () => null) as unknown as typeof prisma.eventSettings.findUnique;
        try {
            const result = await submitRegistration(validInput);
            assert.deepEqual(result, {
                ok: false,
                error: { code: "EVENT_NOT_CONFIGURED", message: "Event settings are not configured" },
            });
        } finally {
            prisma.eventSettings.findUnique = originalFind;
        }
    });

    it("rejects registration outside the configured window", async () => {
        const originalFind = prisma.eventSettings.findUnique;
        prisma.eventSettings.findUnique = (async () => ({
            ...validEvent,
            registrationOpensAt: new Date("2099-01-01T00:00:00.000Z"),
        })) as unknown as typeof prisma.eventSettings.findUnique;
        try {
            const result = await submitRegistration(validInput);
            assert.deepEqual(result, {
                ok: false,
                error: { code: "REGISTRATION_CLOSED", message: "Registration is not currently open" },
            });
        } finally {
            prisma.eventSettings.findUnique = originalFind;
        }
    });

    it("rejects invalid team sizes", async () => {
        const originalFind = prisma.eventSettings.findUnique;
        prisma.eventSettings.findUnique = (async () => ({
            ...validEvent,
            minTeamSize: 3,
        })) as unknown as typeof prisma.eventSettings.findUnique;
        try {
            const result = await submitRegistration(validInput);
            assert.deepEqual(result, {
                ok: false,
                error: { code: "INVALID_TEAM_SIZE", message: "Team must have 3 to 4 members" },
            });
        } finally {
            prisma.eventSettings.findUnique = originalFind;
        }
    });

    it("rejects when the approved-team limit is reached", async () => {
        const originalFind = prisma.eventSettings.findUnique;
        const originalCount = prisma.registration.count;
        let countArgs: unknown;
        prisma.eventSettings.findUnique = (async () => validEvent) as unknown as typeof prisma.eventSettings.findUnique;
        prisma.registration.count = (async (args: unknown) => {
            countArgs = args;
            return validEvent.maxTeams;
        }) as typeof prisma.registration.count;
        try {
            const result = await submitRegistration(validInput);
            assert.deepEqual(result, {
                ok: false,
                error: { code: "MAX_TEAMS_REACHED", message: "Maximum number of teams has been reached" },
            });
            assert.deepEqual(countArgs, { where: { status: "APPROVED" } });
        } finally {
            prisma.eventSettings.findUnique = originalFind;
            prisma.registration.count = originalCount;
        }
    });
});
