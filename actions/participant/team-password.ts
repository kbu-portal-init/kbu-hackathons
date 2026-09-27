"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import { changeTeamPasswordSchema } from "@/lib/contracts/team-password";
import { toFieldErrors } from "@/lib/validation/zod";

export async function changeTeamPassword(input: unknown): Promise<ActionResult<{ changed: true }>> {
    await requireApprovedTeam();

    const parsed = changeTeamPasswordSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Some password fields are invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    try {
        await auth.api.changePassword({
            headers: await headers(),
            body: {
                currentPassword: parsed.data.currentPassword,
                newPassword: parsed.data.newPassword,
                revokeOtherSessions: false,
            },
        });
        return { ok: true, data: { changed: true } };
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.PASSWORD_CHANGE_FAILED,
                message: "Current password is incorrect or password could not be changed",
            },
        };
    }
}
