import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { after as scheduleAfter } from "next/server";
import { findTeamAccountByUsername, isApprovedTeamAccount } from "@/lib/auth/team-access";
import prisma from "@/lib/prisma";
import { sendLoginNotification, sendNotification } from "@/lib/services/notifications";
import { PASSWORD_RESET_TOKEN_TTL_SECONDS } from "@/lib/services/password-reset";
import { upstashSecondaryStorage } from "@/lib/services/rate-limit";

export const auth = betterAuth({
    hooks: {
        before: createAuthMiddleware(async (context) => {
            if (context.path !== "/sign-in/username") return;
            const username = context.body?.username;
            if (typeof username !== "string") return;

            const user = await findTeamAccountByUsername(username);
            if (user && !isApprovedTeamAccount(user)) {
                throw APIError.fromStatus("FORBIDDEN", {
                    message: "Your team registration is still pending approval.",
                });
            }
        }),
        after: createAuthMiddleware(async (context) => {
            if (context.path !== "/sign-in/username" && context.path !== "/sign-in/email") return;
            const session = context.context.newSession;
            const userId = session?.user?.id;
            if (!userId) return;

            scheduleAfter(async () => {
                try {
                    await sendLoginNotification(userId);
                } catch (error) {
                    context.context.logger.error("Failed to send login notification", { userId, error });
                }
            });
        }),
    },
    secondaryStorage: upstashSecondaryStorage,
    verification: {
        // Team setup links are created directly in Prisma's verification table.
        // Keep Better Auth reset-token consumption on the same database backend.
        storeInDatabase: true,
    },
    rateLimit: {
        enabled: true,
        storage: upstashSecondaryStorage ? "secondary-storage" : "memory",
        window: 60,
        max: 100,
        customRules: {
            "/sign-in/email": { window: 60, max: 10 },
            "/change-password": { window: 60, max: 5 },
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: PASSWORD_RESET_TOKEN_TTL_SECONDS,
        sendResetPassword: async ({ user, token }) => {
            const appUrl = (
                process.env.NEXT_PUBLIC_APP_URL ??
                process.env.BETTER_AUTH_URL ??
                "http://localhost:3000"
            ).replace(/\/$/, "");
            const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
            const team = await prisma.team.findUnique({
                where: { userId: user.id },
                select: {
                    members: {
                        where: { role: "LEADER", studentEmailVerifiedAt: { not: null } },
                        select: { studentEmail: true },
                        take: 1,
                    },
                },
            });
            if (team) {
                const leaderEmail = team.members[0]?.studentEmail;
                if (!leaderEmail) {
                    throw new Error("Team password reset requires a verified leader email");
                }
                await sendNotification({
                    type: "PASSWORD_RESET",
                    recipients: [leaderEmail],
                    data: { resetUrl },
                    targetType: "User",
                    targetId: user.id,
                });
                return;
            }
            await sendNotification({
                type: "PASSWORD_RESET",
                recipients: [user.email],
                data: { resetUrl },
                targetType: "User",
                targetId: user.id,
            });
        },
    },
    plugins: [
        username({
            immutableUsername: true,
            usernameValidator: (value) => /^[a-zA-Z0-9_.-]+$/.test(value),
        }),
        admin(),
    ],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "team", // "team" | "organizer" | "admin"
                input: false, // prevent users from setting their own role
            },
        },
    },
    disabledPaths: ["/admin/impersonate-user", "/admin/stop-impersonating"],
});
