import "server-only";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type {
    ApproveRegistrationData,
    ApproveRegistrationInput,
    RejectRegistrationData,
    RejectRegistrationInput,
    SubmitRegistrationData,
    SubmitRegistrationInput,
} from "@/lib/contracts/registration";
import { countApprovedTeams, getRegistrationWithTeam } from "@/lib/data/registrations";
import prisma from "@/lib/prisma";
import { sendTeamRegistrationNotification } from "@/lib/services/notifications";
import { createPasswordSetupUrl } from "@/lib/services/password-reset";
import { checkRegistrationRateLimit } from "@/lib/services/rate-limit";
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

class RegistrationLimitReachedError extends Error {
    constructor() {
        super("Maximum number of teams has been reached");
        this.name = "RegistrationLimitReachedError";
    }
}

class RegistrationStatusChangedError extends Error {
    constructor() {
        super("Registration is no longer pending");
        this.name = "RegistrationStatusChangedError";
    }
}

// ── Internal: create team account and send password setup link ─────

async function provisionTeamAccount(
    registrationId: string,
    teamId: string,
    teamDisplayName: string,
    teamLoginName: string,
    leader: { name: string; studentEmail: string },
    actorId: string | null,
): Promise<ActionResult<ApproveRegistrationData>> {
    const teamEmail = leader.studentEmail;
    const password = randomBytes(24).toString("base64url");

    let userId: string;

    try {
        const existingTeamUser = await prisma.team.findUnique({
            where: { id: teamId },
            select: { userId: true },
        });

        if (existingTeamUser?.userId) {
            userId = existingTeamUser.userId;
        } else {
            const existingUser = await prisma.user.findUnique({ where: { email: teamEmail } });
            if (existingUser) {
                userId = existingUser.id;
            } else {
                await auth.api.signUpEmail({
                    body: {
                        email: teamEmail,
                        password,
                        name: teamDisplayName,
                    },
                });
                const user = await prisma.user.update({
                    where: { email: teamEmail },
                    data: { role: "team" },
                });
                userId = user.id;
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: true,
                username: teamLoginName,
                displayUsername: teamLoginName,
            },
        });

        await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "event_settings" WHERE id = 1 FOR UPDATE`;
            const eventSettings = await tx.eventSettings.findUnique({
                where: { id: 1 },
                select: { maxTeams: true },
            });
            const approvedCount = await tx.registration.count({ where: { status: "APPROVED" } });
            if (!eventSettings || approvedCount >= eventSettings.maxTeams) {
                throw new RegistrationLimitReachedError();
            }

            const claimed = await tx.registration.updateMany({
                where: { id: registrationId, status: "PENDING" },
                data: { status: "APPROVED" },
            });
            if (claimed.count !== 1) {
                throw new RegistrationStatusChangedError();
            }

            await tx.team.update({
                where: { id: teamId },
                data: { userId },
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
    } catch (error) {
        if (error instanceof RegistrationLimitReachedError) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.MAX_TEAMS_REACHED,
                    message: "Maximum number of teams has been reached",
                },
            };
        }

        if (error instanceof RegistrationStatusChangedError) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.INVALID_STATUS,
                    message: "Invalid status",
                },
            };
        }

        try {
            await prisma.auditLog.create({
                data: {
                    action: "REGISTRATION_APPROVAL_FAILED",
                    targetType: "Registration",
                    targetId: registrationId,
                    details: {
                        method: actorId ? "manual" : "auto",
                        error: error instanceof Error ? error.message : "Unknown approval failure",
                    },
                },
            });
        } catch {
            // Failure auditing must not hide the original approval failure.
        }
        return {
            ok: false,
            error: {
                code: ErrorCodes.APPROVAL_FAILED,
                message: "Failed to approve registration",
            },
        };
    }

    let passwordSetupSent = true;
    try {
        const setupUrl = await createPasswordSetupUrl(userId);
        await sendTeamRegistrationNotification({
            type: "TEAM_REGISTRATION_APPROVED",
            teamId,
            registrationId,
            data: { teamName: teamDisplayName, resetUrl: setupUrl },
            actorId: actorId ?? undefined,
        });
    } catch {
        passwordSetupSent = false;
    }

    return {
        ok: true,
        data: {
            registrationId,
            teamLoginName,
            passwordSetupSent,
        },
    };
}

// ── Submit (public, no auth) ───────────────────────────────────────

export async function submitRegistration(
    input: SubmitRegistrationInput,
): Promise<ActionResult<SubmitRegistrationData>> {
    const registrationRateLimit = await checkRegistrationRateLimit(input.leaderEmail, await headers());
    if (!registrationRateLimit.success) {
        return {
            ok: false,
            error: { code: "RATE_LIMITED", message: "Too many registration attempts. Please try again later." },
        };
    }

    const eventSettings = await prisma.eventSettings.findUnique({ where: { id: 1 } });
    if (!eventSettings) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.EVENT_NOT_CONFIGURED,
                message: "Event settings are not configured",
            },
        };
    }

    const now = new Date();
    if (now < eventSettings.registrationOpensAt || now > eventSettings.registrationClosesAt) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.REGISTRATION_CLOSED,
                message: "Registration is not currently open",
            },
        };
    }

    const totalMembers = 1 + input.members.length;
    if (totalMembers < eventSettings.minTeamSize || totalMembers > eventSettings.maxTeamSize) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.INVALID_TEAM_SIZE,
                message: `Team must have ${eventSettings.minTeamSize} to ${eventSettings.maxTeamSize} members`,
            },
        };
    }

    const approvedCount = await countApprovedTeams();
    if (approvedCount >= eventSettings.maxTeams) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.MAX_TEAMS_REACHED,
                message: "Maximum number of teams has been reached",
            },
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

    let verificationEmailsSent = true;
    for (const memberId of result.memberIds) {
        await sendStudentEmailVerification(memberId, { rateLimit: false }).catch(() => {
            verificationEmailsSent = false;
        });
    }

    return {
        ok: true,
        data: {
            registrationId: result.registrationId,
            teamName: result.teamName,
            verificationEmailsSent,
        },
    };
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
            error: {
                code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                message: "Team member not found",
            },
        };
    }

    const allVerified = await allMembersVerified(member.teamId);

    return {
        ok: true,
        data: {
            verified: true,
            allVerified,
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
            error: {
                code: ErrorCodes.REGISTRATION_NOT_FOUND,
                message: "Registration not found",
            },
        };
    }
    if (record.status !== "PENDING") {
        return {
            ok: false,
            error: {
                code: ErrorCodes.INVALID_STATUS,
                message: "Invalid status",
            },
        };
    }

    const allVerified = await allMembersVerified(record.teamId);
    if (!allVerified) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.EMAIL_VERIFICATION_PENDING,
                message:
                    "All team members must verify their email before approval. Unverified members can be manually verified in the detail view.",
            },
        };
    }

    const leader = record.team.members.find((m) => m.role === "LEADER") ?? record.team.members[0];
    if (!leader) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.TEAM_LEADER_NOT_FOUND,
                message: "Team leader not found",
            },
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
            error: {
                code: ErrorCodes.REGISTRATION_NOT_FOUND,
                message: "Registration not found",
            },
        };
    }
    if (record.status !== "PENDING") {
        return {
            ok: false,
            error: {
                code: ErrorCodes.INVALID_STATUS,
                message: "Invalid status",
            },
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
