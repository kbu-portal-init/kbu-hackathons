import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

let session: unknown = { user: { id: "organizer-1", role: "organizer" } };
let banServiceArgs: unknown[] | undefined;
let verificationError: Error | undefined;
let notificationError: unknown;
let createTeamMember: typeof import("@/actions/management/teams").createTeamMember;
let updateTeamMember: typeof import("@/actions/management/teams").updateTeamMember;
let deleteTeamMember: typeof import("@/actions/management/teams").deleteTeamMember;

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

let teamMemberServiceArgs: Record<string, unknown> = {};
let verificationCalls: string[] = [];

const defaultCreateResult = {
    ok: true,
    data: {
        id: "member-1",
        name: "Test Member",
        studentEmail: "u123456789012@ms.kbu.ac.th",
        role: "DEVELOPER",
    },
};

const defaultUpdateResult = {
    ok: true,
    data: {
        id: "member-1",
        name: "Updated Member",
        studentEmail: "u123456789012@ms.kbu.ac.th",
        role: "DEVELOPER",
        studentEmailVerifiedAt: null,
        emailChanged: false,
    },
};

const defaultDeleteResult = {
    ok: true,
    data: {
        id: "member-1",
        cardCleanupFailed: false,
    },
};

let createResult: unknown = defaultCreateResult;
let updateResult: unknown = defaultUpdateResult;
let deleteResult: unknown = defaultDeleteResult;

mock("@/lib/auth/guards", {
    requireOrganizerOrAdmin: async () => {
        if (!session) throw new Error("redirect:/login");
        return session;
    },
    getUserRole: (role: string) =>
        role === "team" || role === "organizer" || role === "admin" ? (role as "team" | "organizer" | "admin") : null,
});
mock("@/lib/services/account-banning", {
    banAccount: async (input: unknown, actorRole: string, actorId: string) => {
        banServiceArgs = [input, actorRole, actorId];
        return { ok: true, data: { userId: (input as { userId: string }).userId } };
    },
    unbanAccount: async (input: unknown, actorRole: string, actorId: string) => {
        banServiceArgs = [input, actorRole, actorId];
        return { ok: true, data: { userId: (input as { userId: string }).userId } };
    },
});
mock("@/lib/services/student-email-verification", {
    sendStudentEmailVerification: async (teamMemberId: string) => {
        verificationCalls.push(teamMemberId);
        if (verificationError) throw verificationError;
    },
});
mock("@/lib/services/team-members", {
    createTeamMember: async (input: unknown, actorId: string) => {
        teamMemberServiceArgs.create = [input, actorId];
        return createResult;
    },
    updateTeamMember: async (input: unknown, actorId: string) => {
        teamMemberServiceArgs.update = [input, actorId];
        return updateResult;
    },
    deleteTeamMember: async (input: unknown, actorId: string) => {
        teamMemberServiceArgs.delete = [input, actorId];
        return deleteResult;
    },
});
mock("@/lib/services/notifications", {
    isNotificationDeliveryError: (error: unknown) => notificationError === error,
});

let banAccount: typeof import("@/actions/admin/accounts").banAccount;
let requestStudentEmailVerification: typeof import("@/actions/management/student-email").requestStudentEmailVerification;

before(async () => {
    ({ banAccount } = await import("@/actions/admin/accounts"));
    ({ requestStudentEmailVerification } = await import("@/actions/management/student-email"));

    const teamActions = await import("@/actions/management/teams");

    createTeamMember = teamActions.createTeamMember;
    updateTeamMember = teamActions.updateTeamMember;
    deleteTeamMember = teamActions.deleteTeamMember;
});

beforeEach(() => {
    session = { user: { id: "admin-1", role: "admin" } };
    banServiceArgs = undefined;
    verificationError = undefined;
    notificationError = undefined;

    teamMemberServiceArgs = {};
    verificationCalls = [];

    createResult = defaultCreateResult;
    updateResult = defaultUpdateResult;
    deleteResult = defaultDeleteResult;
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

const validCreateInput = {
    teamId: "team-1",
    name: "Test Member",
    studentEmail: "u123456789012@ms.kbu.ac.th",
    role: "DEVELOPER",
};

const validUpdateInput = {
    teamId: "team-1",
    memberId: "member-1",
    name: "Updated Member",
    studentEmail: "u123456789012@ms.kbu.ac.th",
    role: "DEVELOPER",
};

const validDeleteInput = {
    teamId: "team-1",
    memberId: "member-1",
};

describe("management TeamMember CRUD actions", () => {
    it("creates a member and requests email verification", async () => {
        const result = await createTeamMember(validCreateInput);

        assert.equal(result.ok, true);
        assert.deepEqual(teamMemberServiceArgs.create, [validCreateInput, "admin-1"]);
        assert.deepEqual(verificationCalls, ["member-1"]);

        if (result.ok) {
            assert.deepEqual(result.data.verificationEmail, { sent: true });
        }
    });

    it("rejects invalid creation input before calling the service", async () => {
        const result = await createTeamMember({
            ...validCreateInput,
            studentEmail: "invalid@example.com",
        });

        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "VALIDATION_ERROR");

        assert.equal(teamMemberServiceArgs.create, undefined);
        assert.deepEqual(verificationCalls, []);
    });

    it("preserves successful creation when verification email delivery fails", async () => {
        verificationError = new Error("SMTP unavailable");
        notificationError = verificationError;

        const result = await createTeamMember(validCreateInput);

        assert.equal(result.ok, true);

        if (result.ok) {
            assert.equal(result.data.id, "member-1");
            assert.equal(result.data.verificationEmail.sent, false);

            if (!result.data.verificationEmail.sent) {
                assert.equal(result.data.verificationEmail.error.code, "EMAIL_SEND_FAILED");
            }
        }
    });

    it("does not request verification when the email remains unchanged", async () => {
        const result = await updateTeamMember(validUpdateInput);

        assert.equal(result.ok, true);
        assert.deepEqual(teamMemberServiceArgs.update, [validUpdateInput, "admin-1"]);
        assert.deepEqual(verificationCalls, []);

        if (result.ok) {
            assert.equal(result.data.verificationEmail, null);
        }
    });

    it("requests verification when the email changes", async () => {
        updateResult = {
            ok: true,
            data: {
                ...defaultUpdateResult.data,
                emailChanged: true,
            },
        };

        const result = await updateTeamMember({
            ...validUpdateInput,
            studentEmail: "u123456789013@ms.kbu.ac.th",
        });

        assert.equal(result.ok, true);
        assert.deepEqual(verificationCalls, ["member-1"]);

        if (result.ok) {
            assert.deepEqual(result.data.verificationEmail, { sent: true });
        }
    });

    it("rejects invalid update input before calling the service", async () => {
        const result = await updateTeamMember({
            ...validUpdateInput,
            memberId: "",
        });

        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "VALIDATION_ERROR");

        assert.equal(teamMemberServiceArgs.update, undefined);
    });

    it("preserves the successful update when verification delivery fails", async () => {
        updateResult = {
            ok: true,
            data: {
                ...defaultUpdateResult.data,
                emailChanged: true,
            },
        };

        verificationError = new Error("SMTP unavailable");
        notificationError = verificationError;

        const result = await updateTeamMember(validUpdateInput);

        assert.equal(result.ok, true);

        if (result.ok) {
            assert.equal(result.data.verificationEmail?.sent, false);
        }
    });

    it("deletes a member and forwards the actor ID", async () => {
        const result = await deleteTeamMember(validDeleteInput);

        assert.deepEqual(result, defaultDeleteResult);
        assert.deepEqual(teamMemberServiceArgs.delete, [validDeleteInput, "admin-1"]);
    });

    it("preserves card cleanup failure information", async () => {
        deleteResult = {
            ok: true,
            data: {
                id: "member-1",
                cardCleanupFailed: true,
            },
        };

        const result = await deleteTeamMember(validDeleteInput);

        assert.deepEqual(result, deleteResult);
    });

    it("rejects invalid deletion input before calling the service", async () => {
        const result = await deleteTeamMember({
            teamId: "team-1",
            memberId: "",
        });

        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "VALIDATION_ERROR");

        assert.equal(teamMemberServiceArgs.delete, undefined);
    });

    it("requires an organizer or admin for CRUD operations", async () => {
        session = null;

        await assert.rejects(() => createTeamMember(validCreateInput), /redirect:\/login/);
        await assert.rejects(() => updateTeamMember(validUpdateInput), /redirect:\/login/);
        await assert.rejects(() => deleteTeamMember(validDeleteInput), /redirect:\/login/);

        assert.deepEqual(teamMemberServiceArgs, {});
        assert.deepEqual(verificationCalls, []);
    });
});
