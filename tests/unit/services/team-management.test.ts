import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let prisma: typeof import("@/lib/prisma").default;
let updateTeam: typeof import("@/lib/services/team-management").updateTeam;
let archiveTeam: typeof import("@/lib/services/team-management").archiveTeam;
let unarchiveTeam: typeof import("@/lib/services/team-management").unarchiveTeam;

type TransactionMock = {
    $queryRaw: (...args: unknown[]) => Promise<unknown>;
    team: {
        findUnique: (...args: unknown[]) => Promise<unknown>;
        update: (args: { where: { id: string }; data: Record<string, unknown>; select?: unknown }) => Promise<unknown>;
    };
    registration: {
        count: (...args: unknown[]) => Promise<number>;
    };
    eventSettings: {
        findUnique: (...args: unknown[]) => Promise<unknown>;
    };
    auditLog: {
        create: (args: { data: unknown }) => Promise<unknown>;
    };
};

const teamRecord = {
    id: "team-1",
    displayName: "Original Team",
    program: "THAI_PROGRAM",
    registration: { status: "APPROVED" },
};

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

    ({ default: prisma } = await import("@/lib/prisma"));

    const service = await import("@/lib/services/team-management");
    ({ updateTeam, archiveTeam, unarchiveTeam } = service);
});

async function withTransaction<T>(tx: TransactionMock, run: () => Promise<T>): Promise<T> {
    const originalTransaction = prisma.$transaction;

    prisma.$transaction = (async (callback: (client: typeof prisma) => Promise<unknown>) =>
        callback(tx as unknown as typeof prisma)) as unknown as typeof prisma.$transaction;

    try {
        return await run();
    } finally {
        prisma.$transaction = originalTransaction;
    }
}

function createTransaction(overrides: Partial<TransactionMock> = {}): TransactionMock {
    return {
        $queryRaw: async () => [],
        team: {
            findUnique: async () => teamRecord,
            update: async ({ where, data }) => ({
                id: where.id,
                displayName: data.displayName ?? teamRecord.displayName,
                program: data.program ?? teamRecord.program,
            }),
        },
        registration: {
            count: async () => 0,
        },
        eventSettings: {
            findUnique: async () => ({
                maxThaiTeams: 10,
                maxInternationalTeams: 10,
            }),
        },
        auditLog: {
            create: async () => ({}),
        },
        ...overrides,
    };
}

describe("updateTeam", () => {
    it("updates the display name without checking programme quota", async () => {
        let updateData: Record<string, unknown> | undefined;
        let quotaChecked = false;
        let auditData: unknown;

        const tx = createTransaction({
            team: {
                findUnique: async () => teamRecord,
                update: async ({ where, data }) => {
                    updateData = data;
                    return {
                        id: where.id,
                        displayName: data.displayName,
                        program: data.program,
                    };
                },
            },
            registration: {
                count: async () => {
                    quotaChecked = true;
                    return 0;
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () =>
            updateTeam({ teamId: "team-1", displayName: "Updated Team" }, "admin-1"),
        );

        assert.deepEqual(result, {
            ok: true,
            data: {
                teamId: "team-1",
                displayName: "Updated Team",
                program: "THAI_PROGRAM",
            },
        });
        assert.equal(updateData?.displayName, "Updated Team");
        assert.equal(updateData?.program, "THAI_PROGRAM");
        assert.equal(quotaChecked, false);

        assert.ok(auditData);
        assert.deepEqual((auditData as { details: unknown }).details, {
            previous: {
                displayName: "Original Team",
                program: "THAI_PROGRAM",
            },
            updated: {
                displayName: "Updated Team",
                program: "THAI_PROGRAM",
            },
        });
    });

    it("allows an approved team to change programme when quota is available", async () => {
        let quotaChecked = false;
        let updateData: Record<string, unknown> | undefined;

        const tx = createTransaction({
            team: {
                findUnique: async () => teamRecord,
                update: async ({ where, data }) => {
                    updateData = data;
                    return {
                        id: where.id,
                        displayName: data.displayName,
                        program: data.program,
                    };
                },
            },
            registration: {
                count: async (args) => {
                    quotaChecked = true;
                    assert.deepEqual(args, {
                        where: {
                            status: "APPROVED",
                            team: { is: { program: "INTERNATIONAL_PROGRAM" } },
                        },
                    });
                    return 4;
                },
            },
        });

        const result = await withTransaction(tx, () =>
            updateTeam({ teamId: "team-1", program: "INTERNATIONAL_PROGRAM" }, "admin-1"),
        );

        assert.equal(result.ok, true);
        assert.equal(quotaChecked, true);
        assert.equal(updateData?.program, "INTERNATIONAL_PROGRAM");
    });

    it("rejects a programme change when the destination quota is full", async () => {
        let teamUpdated = false;

        const tx = createTransaction({
            team: {
                findUnique: async () => teamRecord,
                update: async () => {
                    teamUpdated = true;
                    return {};
                },
            },
            registration: {
                count: async () => 10,
            },
            eventSettings: {
                findUnique: async () => ({
                    maxThaiTeams: 10,
                    maxInternationalTeams: 10,
                }),
            },
        });

        const result = await withTransaction(tx, () =>
            updateTeam({ teamId: "team-1", program: "INTERNATIONAL_PROGRAM" }, "admin-1"),
        );

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "MAX_TEAMS_REACHED");
        }
        assert.equal(teamUpdated, false);
    });

    it("does not check approved quota for a non-approved team", async () => {
        let quotaChecked = false;

        const tx = createTransaction({
            team: {
                findUnique: async () => ({
                    ...teamRecord,
                    registration: { status: "PENDING" },
                }),
                update: async ({ where, data }) => ({
                    id: where.id,
                    displayName: data.displayName,
                    program: data.program,
                }),
            },
            registration: {
                count: async () => {
                    quotaChecked = true;
                    return 10;
                },
            },
        });

        const result = await withTransaction(tx, () =>
            updateTeam({ teamId: "team-1", program: "INTERNATIONAL_PROGRAM" }, "admin-1"),
        );

        assert.equal(result.ok, true);
        assert.equal(quotaChecked, false);
    });

    it("returns TEAM_NOT_FOUND when the team does not exist", async () => {
        const tx = createTransaction({
            team: {
                findUnique: async () => null,
                update: async () => {
                    throw new Error("Should not update a missing team");
                },
            },
        });

        const result = await withTransaction(tx, () =>
            updateTeam({ teamId: "missing-team", displayName: "Updated Team" }, "admin-1"),
        );

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "TEAM_NOT_FOUND");
        }
    });

    it("maps audit creation failures to UPDATE_FAILED", async () => {
        const tx = createTransaction({
            auditLog: {
                create: async () => {
                    throw new Error("Audit database failure");
                },
            },
        });

        const result = await withTransaction(tx, () =>
            updateTeam({ teamId: "team-1", displayName: "Updated Team" }, "admin-1"),
        );

        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "UPDATE_FAILED");
        }
    });
});

describe("archiveTeam", () => {
    it("archives an active team and writes an audit log", async () => {
        let updatedData: Record<string, unknown> | undefined;
        let auditData: unknown;

        const tx = createTransaction({
            team: {
                findUnique: async () => ({
                    id: "team-1",
                    archivedAt: null,
                }),
                update: async ({ data }) => {
                    updatedData = data;
                    return {};
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => archiveTeam({ teamId: "team-1" }, "admin-1"));

        assert.equal(result.ok, true);
        assert.ok(updatedData?.archivedAt instanceof Date);
        assert.ok(auditData);
        assert.equal((auditData as { action: string }).action, "TEAM_ARCHIVED");
    });

    it("does not create another audit log when the team is already archived", async () => {
        let auditCreated = false;
        const archivedAt = new Date("2026-10-01T00:00:00.000Z");

        const tx = createTransaction({
            team: {
                findUnique: async () => ({
                    id: "team-1",
                    archivedAt,
                }),
                update: async () => {
                    throw new Error("Should not update an archived team");
                },
            },
            auditLog: {
                create: async () => {
                    auditCreated = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => archiveTeam({ teamId: "team-1" }, "admin-1"));

        assert.deepEqual(result, {
            ok: true,
            data: {
                teamId: "team-1",
                archivedAt: archivedAt.toISOString(),
            },
        });
        assert.equal(auditCreated, false);
    });
});

describe("unarchiveTeam", () => {
    it("unarchives a team and writes an audit log", async () => {
        let updatedData: Record<string, unknown> | undefined;
        let auditData: unknown;

        const archivedAt = new Date("2026-10-01T00:00:00.000Z");

        const tx = createTransaction({
            team: {
                findUnique: async () => ({
                    id: "team-1",
                    archivedAt,
                }),
                update: async ({ data }) => {
                    updatedData = data;
                    return {};
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    auditData = data;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => unarchiveTeam({ teamId: "team-1" }, "admin-1"));

        assert.deepEqual(result, {
            ok: true,
            data: {
                teamId: "team-1",
                archivedAt: null,
            },
        });
        assert.deepEqual(updatedData, { archivedAt: null });
        assert.equal((auditData as { action: string }).action, "TEAM_UNARCHIVED");
    });

    it("does not create another audit log when the team is already active", async () => {
        let auditCreated = false;

        const tx = createTransaction({
            team: {
                findUnique: async () => ({
                    id: "team-1",
                    archivedAt: null,
                }),
                update: async () => {
                    throw new Error("Should not update an active team");
                },
            },
            auditLog: {
                create: async () => {
                    auditCreated = true;
                    return {};
                },
            },
        });

        const result = await withTransaction(tx, () => unarchiveTeam({ teamId: "team-1" }, "admin-1"));

        assert.deepEqual(result, {
            ok: true,
            data: {
                teamId: "team-1",
                archivedAt: null,
            },
        });
        assert.equal(auditCreated, false);
    });
});
