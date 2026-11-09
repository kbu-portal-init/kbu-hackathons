import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

interface AdminUser {
    email: string;
    name: string;
}

function parseAdminUsers(): AdminUser[] {
    const raw = process.env.ADMIN_USERS;
    if (!raw) {
        throw new Error("ADMIN_USERS environment variable is missing or empty.");
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("ADMIN_USERS must be a non-empty JSON array.");
    }
    return parsed.map((item) => {
        if (!item.email || !item.name) {
            throw new Error("Each object in ADMIN_USERS must contain 'email' and 'name'.");
        }
        return { email: item.email.trim(), name: item.name.trim() };
    });
}

const adminUsers = parseAdminUsers();
const bootstrapPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "";

if (!bootstrapPassword) {
    console.warn("WARNING: ADMIN_DEFAULT_PASSWORD is not set. New user signups may fail if a password is required.");
}

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

async function main() {
    try {
        for (const { email, name } of adminUsers) {
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
                    console.log(`Reconciled admin access: ${email} (${name})`);
                } else {
                    console.log(`Existing admin unchanged: ${email} (${name})`);
                }
            } else {
                const result = await auth.api.signUpEmail({
                    body: { email, password: bootstrapPassword, name },
                });
                if (!result.user) throw new Error(`Could not create ${email}`);

                await prisma.user.update({
                    where: { id: result.user.id },
                    data: { role: "admin", emailVerified: true },
                });
                console.log(`Created admin: ${email} (${name})`);
            }
        }
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
