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
let deleteRegistrationRequest: typeof import("@/actions/management/registrations").deleteRegistrationRequest;

let deleteRegistrationServiceArgs: unknown[] | undefined;
let deleteRegistrationServiceResult: unknown = {
    ok: true,
    data: { registrationId: "registration-1" },
};

let updateTeamRequest: typeof import("@/actions/management/teams").updateTeamRequest;
let archiveTeamRequest: typeof import("@/actions/management/teams").archiveTeamRequest;
let unarchiveTeamRequest: typeof import("@/actions/management/teams").unarchiveTeamRequest;

let teamManagementServiceArgs: {
    update?: unknown[];
    archive?: unknown[];
    unarchive?: unknown[];
} = {};

let updateTeamServiceResult: unknown = {
    ok: true,
    data: {
        teamId: "team-1",
        displayName: "Updated Team",
        program: "THAI_PROGRAM",
    },
};

let archiveTeamServiceResult: unknown = {
    ok: true,
    data: {
        teamId: "team-1",
        archivedAt: "2026-11-13T15:00:00.000Z",
    },
};

let unarchiveTeamServiceResult: unknown = {
    ok: true,
    data: {
        teamId: "team-1",
        archivedAt: null,
    },
};

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
let createRegistrationRequest: typeof import("@/actions/management/registrations").createRegistrationRequest;
let registrationServiceArgs: unknown[] | undefined;
let registrationServiceResult: unknown = {
    ok: true,
    data: {
        registrationId: "registration-1",
        teamName: "Build Team",
        verificationEmailsSent: true,
    },
};
let updateRegistrationRequest: typeof import("@/actions/management/registrations").updateRegistrationRequest;
let updateRegistrationServiceArgs: unknown[] | undefined;
let updateRegistrationServiceResult: unknown = {
    ok: true,
    data: { registrationId: "registration-1" },
};

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

mock("@/lib/services/team-management", {
    updateTeam: async (input: unknown, actorId: string) => {
        teamManagementServiceArgs.update = [input, actorId];
        return updateTeamServiceResult;
    },
    archiveTeam: async (input: unknown, actorId: string) => {
        teamManagementServiceArgs.archive = [input, actorId];
        return archiveTeamServiceResult;
    },
    unarchiveTeam: async (input: unknown, actorId: string) => {
        teamManagementServiceArgs.unarchive = [input, actorId];
        return unarchiveTeamServiceResult;
    },
});

mock("@/lib/services/notifications", {
    isNotificationDeliveryError: (error: unknown) => notificationError === error,
});

mock("@/lib/services/registration", {
    createManagementRegistration: async (input: unknown, actorId: string) => {
        registrationServiceArgs = [input, actorId];
        return registrationServiceResult;
    },
    updateRegistration: async (input: unknown, actorId: string) => {
        updateRegistrationServiceArgs = [input, actorId];
        return updateRegistrationServiceResult;
    },
    deleteRegistration: async (input: unknown, actorId: string) => {
        deleteRegistrationServiceArgs = [input, actorId];
        return deleteRegistrationServiceResult;
    },
});

let banAccount: typeof import("@/actions/admin/accounts").banAccount;
let requestStudentEmailVerification: typeof import("@/actions/management/student-email").requestStudentEmailVerification;

// Load management actions
before(async () => {
    ({ banAccount } = await import("@/actions/admin/accounts"));
    ({ requestStudentEmailVerification } = await import("@/actions/management/student-email"));
    ({ createRegistrationRequest } = await import("@/actions/management/registrations"));
    ({ updateRegistrationRequest } = await import("@/actions/management/registrations"));
    ({ deleteRegistrationRequest } = await import("@/actions/management/registrations"));
    const teamActions = await import("@/actions/management/teams");

    createTeamMember = teamActions.createTeamMember;
    updateTeamMember = teamActions.updateTeamMember;
    deleteTeamMember = teamActions.deleteTeamMember;
    updateTeamRequest = teamActions.updateTeamRequest;
    archiveTeamRequest = teamActions.archiveTeamRequest;
    unarchiveTeamRequest = teamActions.unarchiveTeamRequest;
});

// Reset mock state before each test
beforeEach(() => {
    session = { user: { id: "admin-1", role: "admin" } };
    banServiceArgs = undefined;
    verificationError = undefined;
    notificationError = undefined;
    registrationServiceArgs = undefined;
    registrationServiceResult = {
        ok: true,
        data: {
            registrationId: "registration-1",
            teamName: "Build Team",
            verificationEmailsSent: true,
        },
    };
    teamMemberServiceArgs = {};
    verificationCalls = [];

    createResult = defaultCreateResult;
    updateResult = defaultUpdateResult;
    deleteResult = defaultDeleteResult;
    updateRegistrationServiceArgs = undefined;
    updateRegistrationServiceResult = {
        ok: true,
        data: { registrationId: "registration-1" },
    };
    deleteRegistrationServiceArgs = undefined;
    deleteRegistrationServiceResult = {
        ok: true,
        data: { registrationId: "registration-1" },
    };
    teamManagementServiceArgs = {};

    updateTeamServiceResult = {
        ok: true,
        data: {
            teamId: "team-1",
            displayName: "Updated Team",
            program: "THAI_PROGRAM",
        },
    };

    archiveTeamServiceResult = {
        ok: true,
        data: {
            teamId: "team-1",
            archivedAt: "2026-11-13T15:00:00.000Z",
        },
    };

    unarchiveTeamServiceResult = {
        ok: true,
        data: {
            teamId: "team-1",
            archivedAt: null,
        },
    };
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

const validManagementRegistrationInput = {
    teamName: "Build Team",
    program: "THAI_PROGRAM",
    leaderName: "Leader",
    leaderEmail: "leader@ms.kbu.ac.th",
    leaderRole: "LEADER",
    members: [
        {
            name: "Member",
            email: "member@ms.kbu.ac.th",
            role: "DESIGNER",
        },
    ],
};

describe("management Registration CRUD actions", () => {
    it("updates registration notes and forwards the authenticated actor ID", async () => {
        const input = {
            registrationId: "registration-1",
            applicationNotes: "Updated application notes",
        };

        const result = await updateRegistrationRequest(input);

        assert.deepEqual(result, updateRegistrationServiceResult);
        assert.deepEqual(updateRegistrationServiceArgs, [input, "admin-1"]);
    });

    it("rejects invalid update input before calling the service", async () => {
        const result = await updateRegistrationRequest({
            registrationId: "",
            applicationNotes: "Updated notes",
        });

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
        }

        assert.equal(updateRegistrationServiceArgs, undefined);
    });

    it("requires an organizer or admin before updating a registration", async () => {
        session = null;

        await assert.rejects(
            () =>
                updateRegistrationRequest({
                    registrationId: "registration-1",
                    applicationNotes: "Updated notes",
                }),
            /redirect:\/login/,
        );

        assert.equal(updateRegistrationServiceArgs, undefined);
    });

    it("creates a registration and forwards the authenticated actor ID", async () => {
        const result = await createRegistrationRequest(validManagementRegistrationInput);

        assert.deepEqual(result, registrationServiceResult);
        assert.deepEqual(registrationServiceArgs, [validManagementRegistrationInput, "admin-1"]);
    });

    it("rejects invalid creation input before calling the service", async () => {
        const result = await createRegistrationRequest({
            ...validManagementRegistrationInput,
            leaderEmail: "invalid@example.com",
        });

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
        }

        assert.equal(registrationServiceArgs, undefined);
    });

    it("requires an organizer or admin before creating a registration", async () => {
        session = null;

        await assert.rejects(() => createRegistrationRequest(validManagementRegistrationInput), /redirect:\/login/);

        assert.equal(registrationServiceArgs, undefined);
    });

    it("deletes a registration and forwards the authenticated actor ID", async () => {
        const input = { registrationId: "registration-1" };

        const result = await deleteRegistrationRequest(input);

        assert.deepEqual(result, deleteRegistrationServiceResult);
        assert.deepEqual(deleteRegistrationServiceArgs, [input, "admin-1"]);
    });

    it("rejects invalid deletion input before calling the service", async () => {
        const result = await deleteRegistrationRequest({
            registrationId: "",
        });

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
        }

        assert.equal(deleteRegistrationServiceArgs, undefined);
    });

    it("requires an organizer or admin before deleting a registration", async () => {
        session = null;

        await assert.rejects(
            () =>
                deleteRegistrationRequest({
                    registrationId: "registration-1",
                }),
            /redirect:\/login/,
        );

        assert.equal(deleteRegistrationServiceArgs, undefined);
    });
});

describe("management Team actions", () => {
    it("updates team details and forwards the authenticated actor ID", async () => {
        const input = {
            teamId: "team-1",
            displayName: "Updated Team",
            program: "THAI_PROGRAM",
        };

        const result = await updateTeamRequest(input);

        assert.deepEqual(result, updateTeamServiceResult);
        assert.deepEqual(teamManagementServiceArgs.update, [input, "admin-1"]);
    });

    it("rejects invalid team updates before calling the service", async () => {
        const result = await updateTeamRequest({
            teamId: "team-1",
        });

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
        }

        assert.equal(teamManagementServiceArgs.update, undefined);
    });

    it("requires an organizer or admin before updating a team", async () => {
        session = null;

        await assert.rejects(
            () =>
                updateTeamRequest({
                    teamId: "team-1",
                    displayName: "Updated Team",
                }),
            /redirect:\/login/,
        );

        assert.equal(teamManagementServiceArgs.update, undefined);
    });

    it("archives a team and forwards the authenticated actor ID", async () => {
        const input = { teamId: "team-1" };

        const result = await archiveTeamRequest(input);

        assert.deepEqual(result, archiveTeamServiceResult);
        assert.deepEqual(teamManagementServiceArgs.archive, [input, "admin-1"]);
    });

    it("rejects invalid archive input before calling the service", async () => {
        const result = await archiveTeamRequest({
            teamId: "",
        });

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
        }

        assert.equal(teamManagementServiceArgs.archive, undefined);
    });

    it("requires an organizer or admin before archiving a team", async () => {
        session = null;

        await assert.rejects(() => archiveTeamRequest({ teamId: "team-1" }), /redirect:\/login/);

        assert.equal(teamManagementServiceArgs.archive, undefined);
    });

    it("unarchives a team and forwards the authenticated actor ID", async () => {
        const input = { teamId: "team-1" };

        const result = await unarchiveTeamRequest(input);

        assert.deepEqual(result, unarchiveTeamServiceResult);
        assert.deepEqual(teamManagementServiceArgs.unarchive, [input, "admin-1"]);
    });

    it("rejects invalid unarchive input before calling the service", async () => {
        const result = await unarchiveTeamRequest({
            teamId: "",
        });

        assert.equal(result.ok, false);

        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
        }

        assert.equal(teamManagementServiceArgs.unarchive, undefined);
    });

    it("requires an organizer or admin before unarchiving a team", async () => {
        session = null;

        await assert.rejects(() => unarchiveTeamRequest({ teamId: "team-1" }), /redirect:\/login/);

        assert.equal(teamManagementServiceArgs.unarchive, undefined);
    });
});
