import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import prisma from "@/lib/prisma";
import { sendTeamRegistrationNotification } from "@/lib/services/notifications";
import { createPasswordSetupUrl } from "@/lib/services/password-reset";

async function getTeamForPasswordOp(teamId: string) {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            userId: true,
            displayName: true,
            registration: { select: { status: true } },
        },
    });

    if (!team) return { ok: false as const, error: { code: ErrorCodes.TEAM_NOT_FOUND, message: "Team not found" } };
    if (!team.userId)
        return {
            ok: false as const,
            error: { code: ErrorCodes.TEAM_NOT_APPROVED, message: "Team account has not been provisioned yet" },
        };
    if (team.registration?.status !== "APPROVED")
        return {
            ok: false as const,
            error: { code: ErrorCodes.TEAM_NOT_APPROVED, message: "Team registration is not approved" },
        };

    return { ok: true as const, team: { ...team, userId: team.userId } };
}

export async function setTeamPassword(
    teamId: string,
    newPassword: string,
    actorId: string,
): Promise<ActionResult<{ sent: boolean }>> {
    const lookup = await getTeamForPasswordOp(teamId);
    if (!lookup.ok) return lookup;

    try {
        await auth.api.adminUpdateUser({
            body: { userId: lookup.team.userId, data: { password: newPassword } },
            headers: await headers(),
        });

        await prisma.auditLog.create({
            data: {
                actorId,
                action: "TEAM_PASSWORD_SET",
                targetType: "Team",
                targetId: teamId,
                details: { method: "organizer" },
            },
        });

        return { ok: true, data: { sent: false } };
    } catch {
        return {
            ok: false,
            error: { code: ErrorCodes.PASSWORD_CHANGE_FAILED, message: "Failed to set team password" },
        };
    }
}

export async function resetTeamPassword(teamId: string, actorId: string): Promise<ActionResult<{ sent: boolean }>> {
    const lookup = await getTeamForPasswordOp(teamId);
    if (!lookup.ok) return lookup;

    try {
        const resetUrl = await createPasswordSetupUrl(lookup.team.userId);

        await sendTeamRegistrationNotification({
            type: "TEAM_REGISTRATION_APPROVED",
            teamId,
            data: { teamName: lookup.team.displayName, resetUrl },
            actorId,
        });

        await prisma.auditLog.create({
            data: {
                actorId,
                action: "TEAM_PASSWORD_RESET",
                targetType: "Team",
                targetId: teamId,
                details: { method: "organizer" },
            },
        });

        return { ok: true, data: { sent: true } };
    } catch {
        return {
            ok: false,
            error: { code: ErrorCodes.PASSWORD_CHANGE_FAILED, message: "Failed to reset team password" },
        };
    }
}
