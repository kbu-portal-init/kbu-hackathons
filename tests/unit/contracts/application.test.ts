import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { changeAdminPasswordSchema, updateAdminProfileSchema } from "@/lib/contracts/admin-profile";
import { CreateAnnouncementInputSchema, ListAnnouncementSchema } from "@/lib/contracts/announcements";
import { deleteAuditLogSchema, listAuditLogsSchema } from "@/lib/contracts/audits";
import { upsertEventSettingsSchema } from "@/lib/contracts/event-settings";
import {
    approveRegistrationSchema,
    listRegistrationsSchema,
    rejectRegistrationSchema,
    submitRegistrationSchema,
} from "@/lib/contracts/registration";
import { updateTeamLogoSchema } from "@/lib/contracts/team-settings";
import { listTeamsSchema, teamIdSchema } from "@/lib/contracts/teams";
import { listUsersSchema } from "@/lib/contracts/users";

describe("application contracts", () => {
    it("normalizes valid registration submissions and enforces KBU email addresses", () => {
        const valid = submitRegistrationSchema.safeParse({
            teamName: " Build Team ",
            leaderName: " Leader ",
            leaderEmail: "U123456789012@MS.KBU.AC.TH",
            members: [{ name: " Member ", role: "DEVELOPER", email: "u000000000001@ms.kbu.ac.th" }],
        });
        assert.equal(valid.success, true);
        if (valid.success) {
            assert.equal(valid.data.teamName, "Build Team");
            assert.equal(valid.data.leaderEmail, "u123456789012@ms.kbu.ac.th");
            assert.equal(valid.data.leaderRole, "LEADER");
        }
        assert.equal(
            submitRegistrationSchema.safeParse({
                teamName: "Team",
                leaderName: "Leader",
                leaderEmail: "leader@example.com",
                members: [],
            }).success,
            false,
        );
    });

    it("requires registration workflow identifiers and rejection reasons", () => {
        assert.equal(approveRegistrationSchema.safeParse({ registrationId: "registration-1" }).success, true);
        assert.equal(approveRegistrationSchema.safeParse({ registrationId: "" }).success, false);
        assert.equal(
            rejectRegistrationSchema.safeParse({ registrationId: "registration-1", reason: " " }).success,
            false,
        );
        assert.deepEqual(listRegistrationsSchema.parse({}), { page: 1, pageSize: 20 });
    });

    it("validates event chronology and team-size bounds", () => {
        const base = {
            title: "Event",
            registrationOpensAt: "2026-01-01",
            registrationClosesAt: "2026-02-01",
            startsAt: "2026-03-01",
            endsAt: "2026-03-02",
            submissionOpensAt: "2026-02-01",
            submissionDeadline: "2026-02-28",
            maxTeams: 10,
            minTeamSize: 2,
            maxTeamSize: 4,
        };
        assert.equal(upsertEventSettingsSchema.safeParse(base).success, true);
        assert.equal(upsertEventSettingsSchema.safeParse({ ...base, maxTeamSize: 1 }).success, false);
        assert.equal(
            upsertEventSettingsSchema.safeParse({ ...base, registrationClosesAt: "2025-01-01" }).success,
            false,
        );
    });

    it("validates announcement content and pagination", () => {
        assert.equal(CreateAnnouncementInputSchema.safeParse({ title: "Title", content: "Content" }).success, true);
        assert.equal(CreateAnnouncementInputSchema.safeParse({ title: " ", content: "Content" }).success, false);
        assert.equal(
            CreateAnnouncementInputSchema.safeParse({ title: "Title", content: "x".repeat(10_001) }).success,
            false,
        );
        assert.deepEqual(ListAnnouncementSchema.parse({}), { page: 1, pageSize: 20 });
        assert.equal(ListAnnouncementSchema.safeParse({ status: "DELETED" }).success, false);
    });

    it("validates admin profile and password changes", () => {
        assert.equal(
            updateAdminProfileSchema.safeParse({ name: "Admin", email: "admin@example.com", image: null }).success,
            true,
        );
        assert.equal(updateAdminProfileSchema.safeParse({ name: "", email: "invalid" }).success, false);
        assert.equal(
            changeAdminPasswordSchema.safeParse({
                currentPassword: "old-password",
                newPassword: "new-password",
                confirmPassword: "different-password",
            }).success,
            false,
        );
    });

    it("applies list defaults and rejects invalid entity inputs", () => {
        assert.deepEqual(listUsersSchema.parse({}), { page: 1, pageSize: 200 });
        assert.deepEqual(listTeamsSchema.parse({}), { page: 1, pageSize: 20 });
        assert.deepEqual(listAuditLogsSchema.parse({}), { page: 1, pageSize: 20 });
        assert.equal(listUsersSchema.safeParse({ pageSize: 501 }).success, false);
        assert.equal(listTeamsSchema.safeParse({ status: "ARCHIVED" }).success, false);
        assert.equal(listAuditLogsSchema.safeParse({ action: "UNKNOWN" }).success, false);
        assert.equal(teamIdSchema.safeParse({ teamId: "" }).success, false);
        assert.equal(deleteAuditLogSchema.safeParse({ id: "" }).success, false);
        assert.equal(updateTeamLogoSchema.safeParse({ imageUrl: "not-a-url" }).success, false);
        assert.equal(updateTeamLogoSchema.safeParse({ imageUrl: null }).success, true);
    });
});
