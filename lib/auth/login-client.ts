"use client";

import { sendTeamMagicLink as sendTeamMagicLinkAction } from "@/actions/auth/magic-link";
import { authClient } from "@/lib/auth-client";
import { type LoginResult, staffLoginSchema, teamMagicLinkSchema } from "@/lib/contracts/auth";

const success = (): LoginResult => ({ ok: true, data: { authenticated: true } });
const failure = (code: string, message: string): LoginResult => ({ ok: false, error: { code, message } });

export async function loginAsStaff(input: unknown): Promise<LoginResult> {
    const parsed = staffLoginSchema.safeParse(input);
    if (!parsed.success) {
        return failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid login");
    }

    try {
        const result = await authClient.signIn.email(parsed.data);
        if (result.error) return failure("AUTHENTICATION_FAILED", result.error.message ?? "Unable to sign in");
        return success();
    } catch {
        return failure("AUTHENTICATION_FAILED", "Unable to sign in. Please try again.");
    }
}

export async function sendTeamMagicLink(input: unknown): Promise<LoginResult> {
    const parsed = teamMagicLinkSchema.safeParse(input);
    if (!parsed.success) {
        return failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid email");
    }

    const result = await sendTeamMagicLinkAction(parsed.data);
    if (!result.ok) {
        return failure(result.error.code, result.error.message);
    }
    return success();
}
