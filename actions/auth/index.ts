"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { teamMagicLinkSchema } from "@/lib/contracts/auth";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import prisma from "@/lib/prisma";
import { verifyTeamMemberEmail as verifyTeamMemberEmailService } from "@/lib/services/registration";

export async function sendTeamMagicLink(input: unknown): Promise<ActionResult<{ sent: boolean }>> {
    const parsed = teamMagicLinkSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: parsed.error.issues[0]?.message ?? ErrorMessages[ErrorCodes.VALIDATION_ERROR],
            },
        };
    }

    const member = await prisma.teamMember.findFirst({
        where: { studentEmail: parsed.data.email },
        include: { team: { include: { registration: true } } },
    });

    if (member?.role !== "LEADER" || !member?.studentEmailVerifiedAt) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.NOT_AUTHORIZED,
                message: "Only verified team leaders of approved teams can request magic links",
            },
        };
    }

    if (member.team.registration?.status !== "APPROVED") {
        return {
            ok: false,
            error: { code: ErrorCodes.TEAM_NOT_APPROVED, message: ErrorMessages[ErrorCodes.TEAM_NOT_APPROVED] },
        };
    }

    try {
        await auth.api.signInMagicLink({
            body: { email: parsed.data.email, callbackURL: "/teams" },
            headers: await headers(),
        });
        return { ok: true, data: { sent: true } };
    } catch {
        return {
            ok: false,
            error: { code: ErrorCodes.AUTHENTICATION_FAILED, message: ErrorMessages[ErrorCodes.AUTHENTICATION_FAILED] },
        };
    }
}

export async function verifyTeamMemberEmail(token: string): Promise<
    ActionResult<{
        verified: boolean;
        allVerified: boolean;
        alreadyVerified: boolean;
        approvalPending?: boolean;
    }>
> {
    return verifyTeamMemberEmailService(token);
}
