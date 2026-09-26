import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

let adminUpdateError: Error | undefined;
let signupError: Error | undefined;
let notificationError: Error | undefined;
let setupError: Error | undefined;
let adminUpdates: unknown[] = [];
let notifications: unknown[] = [];

class FakeDeliveryError extends Error {}

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

const headersPath = require.resolve("next/headers");
require.cache[headersPath] = {
    id: headersPath,
    filename: headersPath,
    loaded: true,
    exports: { headers: async () => new Headers() },
} as NodeJS.Module;

const configPath = require.resolve("../../../lib/auth/config");
require.cache[configPath] = {
    id: configPath,
    filename: configPath,
    loaded: true,
    exports: {
        auth: {
            api: {
                adminUpdateUser: async (input: unknown) => {
                    if (adminUpdateError) throw adminUpdateError;
                    adminUpdates.push(input);
                },
                signUpEmail: async () => {
                    if (signupError) throw signupError;
                },
            },
        },
    },
} as NodeJS.Module;

const notificationsPath = require.resolve("../../../lib/services/notifications");
require.cache[notificationsPath] = {
    id: notificationsPath,
    filename: notificationsPath,
    loaded: true,
    exports: {
        NotificationDeliveryError: FakeDeliveryError,
        isNotificationDeliveryError: (error: unknown) => error instanceof FakeDeliveryError,
        sendNotification: async (input: unknown) => {
            if (notificationError) throw notificationError;
            notifications.push(input);
        },
        sendTeamRegistrationNotification: async (input: unknown) => {
            if (notificationError) throw notificationError;
            notifications.push(input);
        },
    },
} as NodeJS.Module;

const passwordResetPath = require.resolve("../../../lib/services/password-reset");
require.cache[passwordResetPath] = {
    id: passwordResetPath,
    filename: passwordResetPath,
    loaded: true,
    exports: {
        createPasswordSetupUrl: async (userId: string) => {
            if (setupError) throw setupError;
            return `https://example.test/reset?user=${userId}`;
        },
    },
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;
let organizer: typeof import("@/lib/services/organizer-provisioning");
let teamPassword: typeof import("@/lib/services/team-password");

before(async () => {
    ({ default: prisma } = await import("@/lib/prisma"));
    organizer = await import("@/lib/services/organizer-provisioning");
    teamPassword = await import("@/lib/services/team-password");
});

beforeEach(() => {
    adminUpdateError = undefined;
    signupError = undefined;
    notificationError = undefined;
    setupError = undefined;
    adminUpdates = [];
    notifications = [];
});

describe("organizer account lifecycle", () => {
    it("rejects duplicate organizer emails", async () => {
        const originalFind = prisma.user.findUnique;
        try {
            prisma.user.findUnique = (async () => ({ id: "existing" })) as unknown as typeof prisma.user.findUnique;
            const result = await organizer.provisionOrganizer({
                name: "Organizer",
                email: "organizer@example.com",
                password: "temporary-password",
            });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "EMAIL_EXISTS");
        } finally {
            prisma.user.findUnique = originalFind;
        }
    });

    it("provisions the role and sends a setup link", async () => {
        const originalFind = prisma.user.findUnique;
        const originalUpdate = prisma.user.update;
        try {
            prisma.user.findUnique = (async () => null) as unknown as typeof prisma.user.findUnique;
            prisma.user.update = (async () => ({
                id: "organizer-1",
                email: "organizer@example.com",
            })) as unknown as typeof prisma.user.update;
            const result = await organizer.provisionOrganizer({
                name: "Organizer",
                email: "organizer@example.com",
                password: "temporary-password",
            });
            assert.deepEqual(result, { ok: true, data: { id: "organizer-1" } });
            assert.equal(notifications.length, 1);
            assert.deepEqual(notifications[0], {
                type: "ORGANIZER_ACCOUNT_CREATED",
                recipients: ["organizer@example.com"],
                data: { resetUrl: "https://example.test/reset?user=organizer-1" },
                targetType: "User",
                targetId: "organizer-1",
            });
        } finally {
            prisma.user.findUnique = originalFind;
            prisma.user.update = originalUpdate;
        }
    });

    it("distinguishes signup, setup-link, and email-delivery failures", async () => {
        const originalFind = prisma.user.findUnique;
        const originalUpdate = prisma.user.update;
        try {
            prisma.user.findUnique = (async () => null) as unknown as typeof prisma.user.findUnique;
            prisma.user.update = (async () => ({
                id: "organizer-1",
                email: "o@example.com",
            })) as unknown as typeof prisma.user.update;
            const input = { name: "Organizer", email: "o@example.com", password: "temporary-password" };

            signupError = new Error("signup failed");
            let result = await organizer.provisionOrganizer(input);
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "CREATE_FAILED");

            signupError = undefined;
            setupError = new Error("token failed");
            result = await organizer.provisionOrganizer(input);
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "PASSWORD_SETUP_FAILED");

            setupError = undefined;
            notificationError = new FakeDeliveryError("smtp failed");
            result = await organizer.provisionOrganizer(input);
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "EMAIL_SEND_FAILED");
        } finally {
            prisma.user.findUnique = originalFind;
            prisma.user.update = originalUpdate;
        }
    });

    it("updates only organizer accounts through Better Auth", async () => {
        const originalFind = prisma.user.findFirst;
        try {
            prisma.user.findFirst = (async () => null) as unknown as typeof prisma.user.findFirst;
            let result = await organizer.updateOrganizer({ userId: "user-1", name: "New name" });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "ORGANIZER_NOT_FOUND");

            prisma.user.findFirst = (async () => ({ id: "user-1" })) as unknown as typeof prisma.user.findFirst;
            result = await organizer.updateOrganizer({ userId: "user-1", name: "New name" });
            assert.deepEqual(result, { ok: true, data: { id: "user-1" } });
            assert.deepEqual(adminUpdates[0], {
                body: { userId: "user-1", data: { name: "New name" } },
                headers: new Headers(),
            });
        } finally {
            prisma.user.findFirst = originalFind;
        }
    });
});

describe("team password lifecycle", () => {
    it("rejects missing, unprovisioned, and unapproved teams", async () => {
        const originalFind = prisma.team.findUnique;
        try {
            for (const [team, code] of [
                [null, "TEAM_NOT_FOUND"],
                [{ userId: null, displayName: "Team", registration: { status: "APPROVED" } }, "TEAM_NOT_APPROVED"],
                [{ userId: "user-1", displayName: "Team", registration: { status: "PENDING" } }, "TEAM_NOT_APPROVED"],
            ] as const) {
                prisma.team.findUnique = (async () => team) as unknown as typeof prisma.team.findUnique;
                const result = await teamPassword.setTeamPassword("team-1", "new-password", "admin-1");
                assert.equal(result.ok, false);
                if (!result.ok) assert.equal(result.error.code, code);
            }
        } finally {
            prisma.team.findUnique = originalFind;
        }
    });

    it("sets and resets approved team passwords with audits", async () => {
        const originalFind = prisma.team.findUnique;
        const originalAudit = prisma.auditLog.create;
        const audits: unknown[] = [];
        try {
            prisma.team.findUnique = (async () => ({
                userId: "user-1",
                displayName: "Team One",
                registration: { status: "APPROVED" },
            })) as unknown as typeof prisma.team.findUnique;
            prisma.auditLog.create = (async ({ data }: { data: unknown }) => {
                audits.push(data);
                return {};
            }) as unknown as typeof prisma.auditLog.create;

            assert.deepEqual(await teamPassword.setTeamPassword("team-1", "new-password", "admin-1"), {
                ok: true,
                data: { sent: false },
            });
            assert.deepEqual(await teamPassword.resetTeamPassword("team-1", "admin-1"), {
                ok: true,
                data: { sent: true },
            });
            assert.equal(adminUpdates.length, 1);
            assert.equal(notifications.length, 1);
            assert.deepEqual(
                audits.map((audit) => (audit as { action: string }).action),
                ["TEAM_PASSWORD_SET", "TEAM_PASSWORD_RESET"],
            );
        } finally {
            prisma.team.findUnique = originalFind;
            prisma.auditLog.create = originalAudit;
        }
    });

    it("maps Better Auth and delivery failures to password-change errors", async () => {
        const originalFind = prisma.team.findUnique;
        try {
            prisma.team.findUnique = (async () => ({
                userId: "user-1",
                displayName: "Team One",
                registration: { status: "APPROVED" },
            })) as unknown as typeof prisma.team.findUnique;
            adminUpdateError = new Error("auth failed");
            let result = await teamPassword.setTeamPassword("team-1", "new-password", "admin-1");
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "PASSWORD_CHANGE_FAILED");

            adminUpdateError = undefined;
            notificationError = new Error("delivery failed");
            result = await teamPassword.resetTeamPassword("team-1", "admin-1");
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, "PASSWORD_CHANGE_FAILED");
        } finally {
            prisma.team.findUnique = originalFind;
        }
    });
});
