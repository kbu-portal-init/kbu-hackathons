import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import { upsertEventSettingsSchema } from "@/lib/contracts/event-settings";

let prisma: typeof import("@/lib/prisma").default;
let upsertEventSettings: typeof import("@/lib/services/event-settings").upsertEventSettings;

const validInput = {
    title: "KBU Hackathon",
    description: undefined,
    venue: undefined,
    imageUrls: undefined,
    promoUrl: undefined,
    registrationOpensAt: new Date("2026-01-01T00:00:00.000Z"),
    registrationClosesAt: new Date("2026-02-01T00:00:00.000Z"),
    startsAt: new Date("2026-03-01T00:00:00.000Z"),
    endsAt: new Date("2026-03-02T00:00:00.000Z"),
    submissionOpensAt: new Date("2026-02-01T00:00:00.000Z"),
    submissionDeadline: new Date("2026-02-28T00:00:00.000Z"),
    maxTeams: 20,
    minTeamSize: 2,
    maxTeamSize: 4,
};

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ default: prisma } = await import("@/lib/prisma"));
    ({ upsertEventSettings } = await import("@/lib/services/event-settings"));
});

describe("event settings", () => {
    it("rejects invalid date ordering and team-size bounds", () => {
        const result = upsertEventSettingsSchema.safeParse({
            ...validInput,
            registrationClosesAt: validInput.registrationOpensAt,
            endsAt: validInput.startsAt,
            submissionDeadline: validInput.submissionOpensAt,
            minTeamSize: 5,
            maxTeamSize: 4,
        });

        assert.equal(result.success, false);
        if (result.success) return;
        const paths = result.error.issues.map((issue) => issue.path.join("."));
        assert.ok(paths.includes("registrationClosesAt"));
        assert.ok(paths.includes("endsAt"));
        assert.ok(paths.includes("submissionDeadline"));
        assert.ok(paths.includes("maxTeamSize"));
    });

    it("upserts the singleton and audit record in one transaction", async () => {
        const originalTransaction = prisma.$transaction;
        let upsertArgs: unknown;
        let auditArgs: unknown;

        try {
            prisma.$transaction = (async (callback: (tx: typeof prisma) => Promise<unknown>) =>
                callback({
                    eventSettings: {
                        upsert: async (args: unknown) => {
                            upsertArgs = args;
                            return { id: 1 };
                        },
                    },
                    auditLog: {
                        create: async (args: unknown) => {
                            auditArgs = args;
                            return {};
                        },
                    },
                } as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

            const result = await upsertEventSettings(validInput, "admin-1");

            assert.deepEqual(result, { ok: true, data: { id: 1 } });
            assert.deepEqual(upsertArgs, {
                where: { id: 1 },
                update: {
                    ...validInput,
                    description: null,
                    venue: null,
                    imageUrls: [],
                    promoUrl: null,
                },
                create: {
                    id: 1,
                    ...validInput,
                    description: null,
                    venue: null,
                    imageUrls: [],
                    promoUrl: null,
                },
            });
            assert.deepEqual(auditArgs, {
                data: {
                    actorId: "admin-1",
                    action: "EVENT_SETTINGS_UPSERTED",
                    targetType: "EventSettings",
                    targetId: "1",
                    details: { title: "KBU Hackathon", maxTeams: 20, minTeamSize: 2, maxTeamSize: 4 },
                },
            });
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });

    it("maps transaction failures to the service error", async () => {
        const originalTransaction = prisma.$transaction;
        try {
            prisma.$transaction = (async () => {
                throw new Error("database unavailable");
            }) as typeof prisma.$transaction;
            const result = await upsertEventSettings(validInput, "admin-1");
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "UPSERT_FAILED");
        } finally {
            prisma.$transaction = originalTransaction;
        }
    });
});
