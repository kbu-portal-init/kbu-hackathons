"use client";

import { authClient } from "@/lib/auth-client";
import { staffLoginSchema, teamLoginSchema } from "@/lib/contracts/auth";
import type { ActionResult } from "@/lib/contracts/common";
import { checkTeamAccess } from "./team-access";

type LoginData = { authenticated: true };
type LoginResult = ActionResult<LoginData>;

const success = (): LoginResult => ({ ok: true, data: { authenticated: true } });
const failure = (code: string, message: string): LoginResult => ({ ok: false, error: { code, message } });

export async function loginAsTeam(input: unknown): Promise<LoginResult> {
    const parsed = teamLoginSchema.safeParse(input);
    if (!parsed.success) {
        return failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid login");
    }

    let result: { error?: { message?: string } | null } | undefined;
    try {
        result = await authClient.signIn.username(parsed.data);
    } catch {
        return failure("AUTHENTICATION_FAILED", "Unable to sign in. Please try again.");
    }

    if (result?.error) {
        return failure("AUTHENTICATION_FAILED", result.error.message ?? "Unable to sign in");
    }

    const access = await checkTeamAccess();
    if (!access.approved) {
        await authClient.signOut();
        return failure("TEAM_ACCESS_DENIED", access.message ?? "Your team does not have access.");
    }

    return success();
}

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
