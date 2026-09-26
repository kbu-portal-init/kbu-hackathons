import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

let session: unknown = { user: { id: "organizer-1", role: "organizer" } };
let banServiceArgs: unknown[] | undefined;
let verificationError: Error | undefined;
let notificationError: unknown;

function mock(path: string, exports: object) {
    const filename = require.resolve(path);
    require.cache[filename] = { id: filename, filename, loaded: true, exports } as NodeJS.Module;
}

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

mock("../../../lib/auth/guards", {
    requireOrganizerOrAdmin: async () => {
        if (!session) throw new Error("redirect:/login");
        return session;
    },
    getUserRole: (role: string) =>
        role === "team" || role === "organizer" || role === "admin" ? (role as "team" | "organizer" | "admin") : null,
});
mock("../../../lib/services/account-banning", {
    banAccount: async (input: unknown, actorRole: string, actorId: string) => {
        banServiceArgs = [input, actorRole, actorId];
        return { ok: true, data: { userId: (input as { userId: string }).userId } };
    },
    unbanAccount: async (input: unknown, actorRole: string, actorId: string) => {
        banServiceArgs = [input, actorRole, actorId];
        return { ok: true, data: { userId: (input as { userId: string }).userId } };
    },
});
mock("../../../lib/services/student-email-verification", {
    sendStudentEmailVerification: async () => {
        if (verificationError) throw verificationError;
    },
});
mock("../../../lib/services/notifications", {
    isNotificationDeliveryError: (error: unknown) => notificationError === error,
});

let banAccount: typeof import("@/actions/admin/accounts").banAccount;
let requestStudentEmailVerification: typeof import("@/actions/management/student-email").requestStudentEmailVerification;

before(async () => {
    ({ banAccount } = await import("@/actions/admin/accounts"));
    ({ requestStudentEmailVerification } = await import("@/actions/management/student-email"));
});

beforeEach(() => {
    session = { user: { id: "admin-1", role: "admin" } };
    banServiceArgs = undefined;
    verificationError = undefined;
    notificationError = undefined;
});

describe("management action error mapping", () => {
    it("forwards ban requests with actor role and id", async () => {
        const expiresAt = new Date("2099-01-01T00:00:00.000Z");
        const result = await banAccount({ userId: "user-1", reason: "spam", expiresAt });
        assert.equal(result.ok, true);
        assert.deepEqual(banServiceArgs, [{ userId: "user-1", reason: "spam", expiresAt }, "admin", "admin-1"]);
    });

    it("rejects invalid ban payloads before the service", async () => {
        const result = await banAccount({ userId: "", reason: " " });
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "VALIDATION_ERROR");
        assert.equal(banServiceArgs, undefined);
    });

    it("maps student verification failures to stable error codes", async () => {
        const deliveryFailure = new Error("smtp down");
        const cases: [Error | undefined, unknown, string][] = [
            [new Error("Team member not found"), undefined, "TEAM_MEMBER_NOT_FOUND"],
            [new Error("Invalid student email domain"), undefined, "INVALID_STUDENT_EMAIL"],
            [deliveryFailure, deliveryFailure, "EMAIL_SEND_FAILED"],
            [new Error("unexpected"), undefined, "VERIFICATION_REQUEST_FAILED"],
        ];
        for (const [thrown, notification, code] of cases) {
            verificationError = thrown;
            notificationError = notification;
            const result = await requestStudentEmailVerification({ teamMemberId: "member-1" });
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.error.code, code);
        }
    });

    it("returns sent confirmation on successful delivery", async () => {
        const result = await requestStudentEmailVerification({ teamMemberId: "member-1" });
        assert.deepEqual(result, { ok: true, data: { sent: true } });
    });
});
