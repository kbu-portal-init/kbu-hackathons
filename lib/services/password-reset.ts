import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";

export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60;
export const TEAM_SETUP_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const RESET_TOKEN_IDENTIFIER_PREFIX = "reset-password:";
const TEAM_SETUP_TOKEN_PREFIX = "setup:";
const STANDARD_RESET_TOKEN_PREFIX = "reset:";

/** Creates a long-lived, single-use onboarding link compatible with Better Auth's reset endpoint. */
export async function createPasswordSetupUrl(userId: string) {
    return createPasswordTokenUrl(userId, TEAM_SETUP_TOKEN_PREFIX, TEAM_SETUP_TOKEN_TTL_SECONDS);
}

export async function createPasswordResetUrl(userId: string) {
    return createPasswordTokenUrl(userId, STANDARD_RESET_TOKEN_PREFIX, PASSWORD_RESET_TOKEN_TTL_SECONDS);
}

async function createPasswordTokenUrl(userId: string, tokenPrefix: string, ttlSeconds: number) {
    const token = randomBytes(32).toString("base64url");
    const identifier = `${RESET_TOKEN_IDENTIFIER_PREFIX}${tokenPrefix}${token}`;

    await prisma.$transaction(async (tx) => {
        await tx.verification.deleteMany({
            where: {
                value: userId,
                identifier: { startsWith: `${RESET_TOKEN_IDENTIFIER_PREFIX}${tokenPrefix}` },
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
    return `${appUrl}/reset-password?token=${encodeURIComponent(`${tokenPrefix}${token}`)}`;
}
