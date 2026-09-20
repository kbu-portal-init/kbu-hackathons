"use client";

import { sendTeamMagicLink as sendTeamMagicLinkAction } from "@/actions/auth";
import { authClient } from "@/lib/auth-client";
import { type LoginResult, staffLoginSchema, teamMagicLinkSchema } from "@/lib/contracts/auth";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";

const success = (): LoginResult => ({ ok: true, data: { authenticated: true } });
const failure = (code: string, message: string): LoginResult => ({ ok: false, error: { code, message } });

export async function loginAsStaff(input: unknown): Promise<LoginResult> {
    const parsed = staffLoginSchema.safeParse(input);
    if (!parsed.success) {
        return failure(
            ErrorCodes.VALIDATION_ERROR,
            parsed.error.issues[0]?.message ?? ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        );
    }

    try {
        const result = await authClient.signIn.email(parsed.data);
        if (result.error)
            return failure(
                ErrorCodes.AUTHENTICATION_FAILED,
                result.error.message ?? ErrorMessages[ErrorCodes.AUTHENTICATION_FAILED],
            );
        return success();
    } catch {
        return failure(ErrorCodes.AUTHENTICATION_FAILED, ErrorMessages[ErrorCodes.AUTHENTICATION_FAILED]);
    }
}

export async function sendTeamMagicLink(input: unknown): Promise<LoginResult> {
    const parsed = teamMagicLinkSchema.safeParse(input);
    if (!parsed.success) {
        return failure(
            ErrorCodes.VALIDATION_ERROR,
            parsed.error.issues[0]?.message ?? ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        );
    }

    const result = await sendTeamMagicLinkAction(parsed.data);
    if (!result.ok) {
        return failure(result.error.code, result.error.message);
    }
    return success();
}
