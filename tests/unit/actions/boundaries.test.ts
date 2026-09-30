import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

let adminSession: unknown = { user: { id: "admin-1", role: "admin" } };
let teamSession: unknown = { team: { id: "team-1" }, user: { id: "user-1", role: "team" } };
let organizerSession: unknown = { user: { id: "organizer-1", role: "organizer" } };
let deleteServiceInput: unknown;
let logoServiceArgs: unknown[] | undefined;
let submitServiceInput: unknown;
let validationFailure: { issues: { path: (string | number)[]; message: string }[] } | undefined;

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

mock("@/lib/auth/guards", {
    requireAdmin: async () => {
        if (!adminSession) throw new Error("redirect:/login");
        return adminSession;
    },
    requireApprovedTeam: async () => {
        if (!teamSession) throw new Error("redirect:/login");
        return teamSession;
    },
    requireOrganizerOrAdmin: async () => {
        if (!organizerSession) throw new Error("redirect:/login");
        return organizerSession;
    },
});
mock("@/lib/services/audits", {
    deleteAuditLog: async (input: unknown) => {
        deleteServiceInput = input;
        return { ok: true, data: { id: (input as { id: string }).id } };
    },
});
mock("@/lib/services/team-settings", {
    updateTeamLogo: async (teamId: string, input: unknown) => {
        logoServiceArgs = [teamId, input];
        return { ok: true, data: input };
    },
});
mock("@/lib/services/registration", {
    submitRegistration: async (input: unknown) => {
        submitServiceInput = input;
        return { ok: true, data: { id: "registration-1" } };
    },
    verifyTeamMemberEmail: async (token: string) => ({ ok: true, data: { token } }),
});
mock("@/lib/validation/zod", {
    toFieldErrors: () => (validationFailure ? { field: ["invalid"] } : {}),
});

let deleteAuditLog: typeof import("@/actions/admin/audits").deleteAuditLog;
let updateTeamLogo: typeof import("@/actions/participant/team-settings").updateTeamLogo;
let submitTeamRegistration: typeof import("@/actions/management/registrations").submitTeamRegistration;
let verifyTeamMemberEmail: typeof import("@/actions/auth/index").verifyTeamMemberEmail;

before(async () => {
    ({ deleteAuditLog } = await import("@/actions/admin/audits"));
    ({ updateTeamLogo } = await import("@/actions/participant/team-settings"));
    ({ submitTeamRegistration } = await import("@/actions/management/registrations"));
    ({ verifyTeamMemberEmail } = await import("@/actions/auth/index"));
});

beforeEach(() => {
    adminSession = { user: { id: "admin-1", role: "admin" } };
    teamSession = { team: { id: "team-1" }, user: { id: "user-1", role: "team" } };
    organizerSession = { user: { id: "organizer-1", role: "organizer" } };
    deleteServiceInput = undefined;
    logoServiceArgs = undefined;
    submitServiceInput = undefined;
    validationFailure = undefined;
});

describe("server action boundaries", () => {
    it("blocks admin actions without an admin session", async () => {
        adminSession = null;
        await assert.rejects(() => deleteAuditLog({ id: "audit-1" }), /redirect:\/login/);
        assert.equal(deleteServiceInput, undefined);
    });

    it("returns mapped field errors before reaching the service", async () => {
        validationFailure = { issues: [{ path: ["id"], message: "Required" }] };
        const result = await deleteAuditLog({ id: "" });
        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "VALIDATION_ERROR");
            assert.deepEqual(result.error.fieldErrors, { field: ["invalid"] });
        }
        assert.equal(deleteServiceInput, undefined);
    });

    it("scopes team logo updates to the session team", async () => {
        const result = await updateTeamLogo({ imageUrl: null });
        assert.equal(result.ok, true);
        assert.deepEqual(logoServiceArgs, ["team-1", { imageUrl: null }]);

        teamSession = null;
        await assert.rejects(() => updateTeamLogo({ imageUrl: null }), /redirect:\/login/);
    });

    it("validates public registration input without a session", async () => {
        teamSession = null;
        validationFailure = { issues: [{ path: ["teamName"], message: "Required" }] };
        const invalid = await submitTeamRegistration({ teamName: "" });
        assert.equal(invalid.ok, false);
        assert.equal(submitServiceInput, undefined);

        validationFailure = undefined;
        const valid = await submitTeamRegistration({
            teamName: "Team",
            leaderName: "Leader",
            leaderEmail: "u123456789012@ms.kbu.ac.th",
            members: [],
        });
        assert.equal(valid.ok, true);
        assert.equal((submitServiceInput as unknown as { teamName: string }).teamName, "Team");
    });

    it("verifies member email tokens through the session-free auth action", async () => {
        teamSession = null;
        organizerSession = null;
        adminSession = null;
        const result = await verifyTeamMemberEmail("token-1");
        assert.deepEqual(result, { ok: true, data: { token: "token-1" } });
    });

    it("requires an organizer or admin for registration review listings", async () => {
        organizerSession = null;
        const { listRegistrationRequests } = await import("@/actions/management/registrations");
        await assert.rejects(() => listRegistrationRequests({}), /redirect:\/login/);
    });
});
