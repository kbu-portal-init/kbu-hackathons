import "dotenv/config";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const emails = [
    ...new Set(
        (process.env.ADMIN_USERS ?? "")
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean),
    ),
];
if (emails.length === 0) throw new Error("ADMIN_USERS must contain at least one email address");
if (emails.some((email) => !/^\S+@\S+\.\S+$/.test(email)))
    throw new Error("ADMIN_USERS contains an invalid email address");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
// Intentionally use one operator-provided bootstrap password for new accounts.
// Existing accounts never enter this path, so their passwords remain untouched.
const bootstrapPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "";
if (bootstrapPassword.length < 8) throw new Error("ADMIN_DEFAULT_PASSWORD must be at least 8 characters");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    plugins: [
        username({ immutableUsername: true, usernameValidator: (value) => /^[a-zA-Z0-9_.-]+$/.test(value) }),
        admin(),
    ],
    user: { additionalFields: { role: { type: "string", required: false, defaultValue: "team", input: false } } },
});

const rl = createInterface({ input, output });
async function main() {
    try {
        for (const email of emails) {
            const existing = await prisma.user.findUnique({
                where: { email },
                select: { id: true, role: true, emailVerified: true },
            });

            if (existing) {
                if (existing.role !== "admin" || !existing.emailVerified) {
                    await prisma.user.update({
                        where: { id: existing.id },
                        data: { role: "admin", emailVerified: true },
                    });
                    console.log(`Reconciled admin access: ${email}`);
                } else {
                    console.log(`Existing admin unchanged: ${email}`);
                }
            } else {
                const name = await rl.question(`Display name for ${email}: `);
                const result = await auth.api.signUpEmail({
                    body: { email, password: bootstrapPassword, name: name.trim() || "Admin" },
                });
                if (!result.user) throw new Error(`Could not create ${email}`);
                await prisma.user.update({
                    where: { id: result.user.id },
                    data: { role: "admin", emailVerified: true },
                });
                console.log(`Created admin: ${email}`);
            }
        }
    } finally {
        rl.close();
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
