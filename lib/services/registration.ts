import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/contracts/common";
import type {
    ApproveRegistrationData,
    ApproveRegistrationInput,
    RejectRegistrationData,
    RejectRegistrationInput,
    SubmitRegistrationData,
    SubmitRegistrationInput,
} from "@/lib/contracts/registration";
import { countApprovedTeams, getRegistrationByTeamId, getRegistrationWithTeam } from "@/lib/data/registrations";
import prisma from "@/lib/prisma";
import {
    allMembersVerified,
    consumeStudentEmailVerification,
    sendStudentEmailVerification,
} from "@/lib/services/student-email-verification";

function toLoginName(teamName: string): string {
    return teamName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function uniqueLoginName(base: string): Promise<string> {
    let candidate = base || "team";
    let suffix = 2;
    while (true) {
        const exists = await prisma.team.findUnique({ where: { loginName: candidate } });
        if (!exists) return candidate;
        candidate = `${base}-${suffix}`;
        suffix++;
    }
}

// ── Internal: create team account and send magic link ──────────────

async function provisionTeamAccount(
    registrationId: string,
    teamId: string,
    teamDisplayName: string,
    teamLoginName: string,
    leader: { name: string; studentEmail: string },
    actorId: string | null,
): Promise<ActionResult<ApproveRegistrationData>> {
    const teamEmail = leader.studentEmail;
    const tempPassword = crypto.randomUUID();

    try {
        await auth.api.signUpEmail({
            body: {
                email: teamEmail,
                password: tempPassword,
                name: teamDisplayName,
            },
        });

        const user = await prisma.user.update({
            where: { email: teamEmail },
            data: {
                role: "team",
                emailVerified: true,
                username: teamLoginName,
                displayUsername: teamLoginName,
            },
        });

        await prisma.$transaction(async (tx) => {
            await tx.team.update({
                where: { id: teamId },
                data: { userId: user.id },
            });

            await tx.registration.update({
                where: { id: registrationId },
                data: { status: "APPROVED" },
            });

            await tx.registrationReview.create({
                data: {
                    registrationId,
                    reviewerId: actorId,
                    decision: "APPROVED",
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "REGISTRATION_APPROVED",
                    targetType: "Registration",
                    targetId: registrationId,
                    details: {
                        teamLoginName,
                        method: actorId ? "manual" : "auto",
                    },
                },
            });
        });

        await auth.api.signInMagicLink({
            body: {
                email: leader.studentEmail,
                callbackURL: "/teams",
            },
            headers: await headers(),
        });
    } catch {
        return {
            ok: false,
            error: { code: "APPROVAL_FAILED", message: "Failed to approve registration" },
        };
    }

    return {
        ok: true,
        data: {
            registrationId,
            teamLoginName,
        },
    };
}

// ── Submit (public, no auth) ───────────────────────────────────────

export async function submitRegistration(
    input: SubmitRegistrationInput,
): Promise<ActionResult<SubmitRegistrationData>> {
    const eventSettings = await prisma.eventSettings.findUnique({ where: { id: 1 } });
    if (!eventSettings) {
        return {
            ok: false,
            error: { code: "EVENT_NOT_CONFIGURED", message: "Event settings are not configured" },
        };
    }

    const now = new Date();
    if (now < eventSettings.registrationOpensAt || now > eventSettings.registrationClosesAt) {
        return {
            ok: false,
            error: { code: "REGISTRATION_CLOSED", message: "Registration is not currently open" },
        };
    }

    const totalMembers = 1 + input.members.length;
    if (totalMembers < eventSettings.minTeamSize || totalMembers > eventSettings.maxTeamSize) {
        return {
            ok: false,
            error: {
                code: "INVALID_TEAM_SIZE",
                message: `Team must have ${eventSettings.minTeamSize} to ${eventSettings.maxTeamSize} members`,
            },
        };
    }

    const approvedCount = await countApprovedTeams();
    if (approvedCount >= eventSettings.maxTeams) {
        return {
            ok: false,
            error: { code: "MAX_TEAMS_REACHED", message: "Maximum number of teams has been reached" },
        };
    }

    const loginName = await uniqueLoginName(toLoginName(input.teamName));

    const result = await prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
            data: {
                loginName,
                displayName: input.teamName,
            },
        });

        const allMembers = [
            { name: input.leaderName, role: input.leaderRole, email: input.leaderEmail },
            ...input.members,
        ];

        const createdMembers = await Promise.all(
            allMembers.map((m) =>
                tx.teamMember.create({
                    data: {
                        teamId: team.id,
                        name: m.name,
                        role: m.role,
                        studentEmail: m.email,
                    },
                    select: { id: true },
                }),
            ),
        );

        const registration = await tx.registration.create({
            data: {
                teamId: team.id,
                applicationNotes: `Registered by ${input.leaderName}`,
                submittedAt: now,
            },
        });

        return {
            registrationId: registration.id,
            teamName: team.displayName,
            memberIds: createdMembers.map((m) => m.id),
        };
    });

    for (const memberId of result.memberIds) {
        await sendStudentEmailVerification(memberId).catch(() => {
            // Don't fail the whole registration if one email fails
        });
    }

    return { ok: true, data: { registrationId: result.registrationId, teamName: result.teamName } };
}

// ── Verify team member email (public, no auth) ─────────────────────

export async function verifyTeamMemberEmail(token: string): Promise<
    ActionResult<{
        verified: boolean;
        allVerified: boolean;
        alreadyVerified: boolean;
    }>
> {
    const consumeResult = await consumeStudentEmailVerification(token);
    if (!consumeResult.ok) {
        return consumeResult;
    }

    const member = await prisma.teamMember.findUnique({
        where: { id: consumeResult.data.teamMemberId },
        select: { teamId: true },
    });
    if (!member) {
        return {
            ok: false,
            error: { code: "TEAM_MEMBER_NOT_FOUND", message: "Team member not found" },
        };
    }

    const allVerified = await allMembersVerified(member.teamId);
    if (!allVerified) {
        return {
            ok: true,
            data: {
                verified: true,
                allVerified: false,
                alreadyVerified: consumeResult.data.alreadyVerified,
            },
        };
    }

    const registration = await getRegistrationByTeamId(member.teamId);
    if (registration?.status !== "PENDING") {
        return {
            ok: true,
            data: {
                verified: true,
                allVerified: true,
                alreadyVerified: consumeResult.data.alreadyVerified,
            },
        };
    }

    const leader = registration.team.members.find((m) => m.role === "LEADER") ?? registration.team.members[0];
    if (!leader) {
        return {
            ok: true,
            data: {
                verified: true,
                allVerified: true,
                alreadyVerified: consumeResult.data.alreadyVerified,
            },
        };
    }

    await provisionTeamAccount(
        registration.id,
        registration.teamId,
        registration.team.displayName,
        registration.team.loginName,
        { name: leader.name, studentEmail: leader.studentEmail },
        null,
    );

    return {
        ok: true,
        data: {
            verified: true,
            allVerified: true,
            alreadyVerified: consumeResult.data.alreadyVerified,
        },
    };
}

// ── Approve (management) ───────────────────────────────────────────

export async function approveRegistration(
    input: ApproveRegistrationInput,
    actorId: string,
): Promise<ActionResult<ApproveRegistrationData>> {
    const record = await getRegistrationWithTeam(input.registrationId);
    if (!record) {
        return {
            ok: false,
            error: { code: "REGISTRATION_NOT_FOUND", message: "Registration not found" },
        };
    }
    if (record.status !== "PENDING") {
        return {
            ok: false,
            error: { code: "INVALID_STATUS", message: "Registration is not pending" },
        };
    }

    const allVerified = await allMembersVerified(record.teamId);
    if (!allVerified) {
        return {
            ok: false,
            error: {
                code: "EMAIL_VERIFICATION_PENDING",
                message:
                    "All team members must verify their email before approval. Unverified members can be manually verified in the detail view.",
            },
        };
    }

    const leader = record.team.members.find((m) => m.role === "LEADER") ?? record.team.members[0];
    if (!leader) {
        return {
            ok: false,
            error: { code: "NO_LEADER", message: "No team leader found" },
        };
    }

    return provisionTeamAccount(
        record.id,
        record.teamId,
        record.team.displayName,
        record.team.loginName,
        { name: leader.name, studentEmail: leader.studentEmail },
        actorId,
    );
}

// ── Reject (management) ────────────────────────────────────────────

export async function rejectRegistration(
    input: RejectRegistrationInput,
    actorId: string,
): Promise<ActionResult<RejectRegistrationData>> {
    const record = await getRegistrationWithTeam(input.registrationId);
    if (!record) {
        return {
            ok: false,
            error: { code: "REGISTRATION_NOT_FOUND", message: "Registration not found" },
        };
    }
    if (record.status !== "PENDING") {
        return {
            ok: false,
            error: { code: "INVALID_STATUS", message: "Registration is not pending" },
        };
    }

    await prisma.$transaction(async (tx) => {
        await tx.registration.update({
            where: { id: record.id },
            data: { status: "REJECTED" },
        });

        await tx.registrationReview.create({
            data: {
                registrationId: record.id,
                reviewerId: actorId,
                decision: "REJECTED",
                reason: input.reason,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId,
                action: "REGISTRATION_REJECTED",
                targetType: "Registration",
                targetId: record.id,
                details: { reason: input.reason },
            },
        });
    });

    const { sendTeamRegistrationNotification } = await import("@/lib/services/notifications");
    await sendTeamRegistrationNotification({
        type: "TEAM_REGISTRATION_REJECTED",
        teamId: record.teamId,
        registrationId: record.id,
        data: { reason: input.reason },
        actorId,
    }).catch(() => {});

    return { ok: true, data: { registrationId: record.id } };
}
