import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";

export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60;
export const TEAM_SETUP_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const RESET_TOKEN_IDENTIFIER_PREFIX = "reset-password:";

/** Creates a long-lived, single-use onboarding link compatible with Better Auth's reset endpoint. */
export async function createPasswordSetupUrl(userId: string) {
    return createPasswordTokenUrl(userId, TEAM_SETUP_TOKEN_TTL_SECONDS);
}

export async function createPasswordResetUrl(userId: string) {
    return createPasswordTokenUrl(userId, PASSWORD_RESET_TOKEN_TTL_SECONDS);
}

async function createPasswordTokenUrl(userId: string, ttlSeconds: number) {
    const token = randomBytes(32).toString("base64url");
    // Better Auth consumes verification records using exactly
    // `reset-password:${token}`. Do not add an application-specific prefix to
    // the token itself: the emailed token is passed directly to resetPassword.
    const identifier = `${RESET_TOKEN_IDENTIFIER_PREFIX}${token}`;

    await prisma.$transaction(async (tx) => {
        await tx.verification.deleteMany({
            where: {
                value: userId,
                identifier: { startsWith: RESET_TOKEN_IDENTIFIER_PREFIX },
            },
        });
        await tx.verification.create({
            data: {
                id: randomUUID(),
                identifier,
                value: userId,
                expiresAt: new Date(Date.now() + ttlSeconds * 1000),
            },
        });
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(
        /\/$/,
        "",
    );
    return `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
}
