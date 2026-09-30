import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

type Email = { to: string[]; subject: string; text: string; html: string };

let sentEmails: Email[] = [];
let emailFailure: Error | undefined;
let scheduled: Array<() => Promise<void>> = [];

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

const emailPath = require.resolve("../../../lib/services/email");
require.cache[emailPath] = {
    id: emailPath,
    filename: emailPath,
    loaded: true,
    exports: {
        sendEmail: async (message: Email) => {
            if (emailFailure) throw emailFailure;
            sentEmails.push(message);
        },
    },
} as NodeJS.Module;

const nextServerPath = require.resolve("next/server");
const originalNextServer = require(nextServerPath);
require.cache[nextServerPath] = {
    id: nextServerPath,
    filename: nextServerPath,
    loaded: true,
    exports: {
        ...originalNextServer,
        after: (callback: () => Promise<void>) => scheduled.push(callback),
    },
} as NodeJS.Module;

let prisma: typeof import("@/lib/prisma").default;
let notifications: typeof import("@/lib/services/notifications");

before(async () => {
    ({ default: prisma } = await import("@/lib/prisma"));
    notifications = await import("@/lib/services/notifications");
});

beforeEach(() => {
    sentEmails = [];
    scheduled = [];
    emailFailure = undefined;
});

describe("notifications", () => {
    it("normalizes and deduplicates recipients and escapes HTML", async () => {
        const result = await notifications.sendNotification({
            type: "TEAM_REGISTRATION_REJECTED",
            recipients: [" Leader@Example.com ", "leader@example.com", ""],
            data: { teamName: "<Team>", reason: '<script>alert("x")</script>' },
        });

        assert.deepEqual(result, { sent: true, recipients: ["leader@example.com"] });
        assert.deepEqual(sentEmails[0]?.to, ["leader@example.com"]);
        assert.match(sentEmails[0]?.subject ?? "", /<Team>/);
        assert.match(sentEmails[0]?.html ?? "", /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
        assert.equal(scheduled.length, 1);
    });

    it("rejects empty recipient lists without attempting delivery", async () => {
        await assert.rejects(
            () =>
                notifications.sendNotification({
                    type: "ACCOUNT_UNBANNED",
                    recipients: [" ", ""],
                    data: {},
                }),
            (error: unknown) => notifications.isNotificationDeliveryError(error) && error.recipients.length === 0,
        );
        assert.equal(sentEmails.length, 0);
    });

    it("wraps SMTP failures and schedules a failure audit", async () => {
        emailFailure = new Error("smtp unavailable");
        await assert.rejects(
            () =>
                notifications.sendNotification({
                    type: "PASSWORD_RESET",
                    recipients: ["user@example.com"],
                    data: { resetUrl: "https://example.test/reset?a=1&b=2" },
                }),
            (error: unknown) =>
                notifications.isNotificationDeliveryError(error) &&
                error.recipients[0] === "user@example.com" &&
                error.cause === emailFailure,
        );
        assert.equal(scheduled.length, 1);
    });

    it("records scheduled audits without changing delivery when audit persistence fails", async () => {
        const originalCreate = prisma.auditLog.create;
        try {
            prisma.auditLog.create = (async () => {
                throw new Error("audit unavailable");
            }) as unknown as typeof prisma.auditLog.create;
            const result = await notifications.sendNotification({
                type: "ACCOUNT_BANNED",
                recipients: ["user@example.com"],
                data: { reason: "Policy" },
                actorId: "admin-1",
                targetType: "User",
                targetId: "user-1",
            });
            assert.equal(result.sent, true);
            await scheduled[0]?.();
        } finally {
            prisma.auditLog.create = originalCreate;
        }
    });

    it("requires a team and verified leader for registration notifications", async () => {
        const originalFindUnique = prisma.team.findUnique;
        try {
            prisma.team.findUnique = (async () => null) as unknown as typeof prisma.team.findUnique;
            await assert.rejects(
                () =>
                    notifications.sendTeamRegistrationNotification({
                        type: "TEAM_REGISTRATION_REJECTED",
                        teamId: "missing",
                        data: {},
                    }),
                notifications.NotificationTargetNotFoundError,
            );

            prisma.team.findUnique = (async () => ({
                id: "team-1",
                displayName: "Team One",
                members: [],
            })) as unknown as typeof prisma.team.findUnique;
            await assert.rejects(
                () =>
                    notifications.sendTeamRegistrationNotification({
                        type: "TEAM_REGISTRATION_REJECTED",
                        teamId: "team-1",
                        data: {},
                    }),
                (error: unknown) => notifications.isNotificationDeliveryError(error),
            );
        } finally {
            prisma.team.findUnique = originalFindUnique;
        }
    });

    it("requires a setup URL for approval and sends to the verified leader", async () => {
        const originalFindUnique = prisma.team.findUnique;
        try {
            prisma.team.findUnique = (async () => ({
                id: "team-1",
                displayName: "Team One",
                members: [{ studentEmail: "Leader@Example.com" }],
            })) as unknown as typeof prisma.team.findUnique;

            await assert.rejects(
                () =>
                    notifications.sendTeamRegistrationNotification({
                        type: "TEAM_REGISTRATION_APPROVED",
                        teamId: "team-1",
                        data: {},
                    }),
                /password reset URL is required/i,
            );

            const result = await notifications.sendTeamRegistrationNotification({
                type: "TEAM_REGISTRATION_APPROVED",
                teamId: "team-1",
                registrationId: "registration-1",
                data: { resetUrl: "https://example.test/reset", username: "team-one" },
            });
            assert.deepEqual(result.recipients, ["leader@example.com"]);
            assert.match(sentEmails[0]?.subject ?? "", /Team One/);
        } finally {
            prisma.team.findUnique = originalFindUnique;
        }
    });
});
