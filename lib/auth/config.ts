import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your KBU Hub password",
                text: `Reset your password: ${url}`,
            });
        },
    },
    plugins: [username({ immutableUsername: true }), admin()],
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
});
