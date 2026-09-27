"use client";

import type { ZodSchema } from "zod";
import { setSessionHint } from "@/lib/auth/session-hint";
import { authClient } from "@/lib/auth-client";
import { type LoginResult, staffLoginSchema, teamLoginSchema } from "@/lib/contracts/auth";
import { ErrorCodes } from "@/lib/contracts/errors";

const failure = (code: string, message: string): LoginResult => ({ ok: false, error: { code, message } });

async function loginWith(
    input: unknown,
    schema: ZodSchema,
    authFn: (data: unknown) => Promise<unknown>,
): Promise<LoginResult> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        return failure(ErrorCodes.VALIDATION_ERROR, parsed.error.issues[0]?.message ?? "Some fields are invalid");
    }
    try {
        const result = await authFn(parsed.data);
        if (result && typeof result === "object" && "error" in result && result.error) {
            const err = result.error as { message?: string };
            return failure(
                ErrorCodes.AUTHENTICATION_FAILED,
                err.message ?? "Unable to authenticate. Please try again.",
            );
        }
        setSessionHint();
        return { ok: true, data: { authenticated: true } };
    } catch {
        return failure(ErrorCodes.AUTHENTICATION_FAILED, "Unable to authenticate. Please try again.");
    }
}

export const loginAsTeam = (input: unknown) =>
    loginWith(input, teamLoginSchema, (d) => authClient.signIn.username(d as { username: string; password: string }));

export const loginAsStaff = (input: unknown) =>
    loginWith(input, staffLoginSchema, (d) => authClient.signIn.email(d as { email: string; password: string }));
