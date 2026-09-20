import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { magicLink } from "better-auth/plugins/magic-link";
import { username } from "better-auth/plugins/username";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/services/notifications";
import { PASSWORD_RESET_TOKEN_TTL_SECONDS } from "@/lib/services/password-reset";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: PASSWORD_RESET_TOKEN_TTL_SECONDS,
        sendResetPassword: async ({ user, url }) => {
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
                    data: { resetUrl: url },
                    targetType: "User",
                    targetId: user.id,
                });
                return;
            }
            await sendNotification({
                type: "PASSWORD_RESET",
                recipients: [user.email],
                data: { resetUrl: url },
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
        magicLink({
            sendMagicLink: async ({ email, url }, _ctx) => {
                const team = await prisma.team.findFirst({
                    where: {
                        members: { some: { studentEmail: email, role: "LEADER" } },
                    },
                    select: { displayName: true },
                });
                await sendNotification({
                    type: "TEAM_REGISTRATION_APPROVED",
                    recipients: [email],
                    data: { teamName: team?.displayName, resetUrl: url },
                });
            },
        }),
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
