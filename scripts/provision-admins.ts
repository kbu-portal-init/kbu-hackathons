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
const passwordPrompt = async (email: string) => {
    if (!input.isTTY || !input.setRawMode) throw new Error("Admin provisioning requires an interactive terminal");
    output.write(`Password for ${email}: `);
    input.setRawMode(true);
    input.resume();
    return new Promise<string>((resolve, reject) => {
        let password = "";
        const onData = (chunk: Buffer) => {
            for (const character of chunk.toString()) {
                if (character === "\u0003") {
                    cleanup();
                    reject(new Error("Cancelled"));
                    return;
                }
                if (character === "\r" || character === "\n") {
                    cleanup();
                    output.write("\n");
                    resolve(password);
                    return;
                }
                if (character === "\u007f") {
                    password = password.slice(0, -1);
                    continue;
                }
                password += character;
            }
        };
        const cleanup = () => {
            input.setRawMode?.(false);
            input.off("data", onData);
        };
        input.on("data", onData);
    });
};
try {
    for (const email of emails) {
        const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        const name = await rl.question(`Display name for ${email}${existing ? " [Admin]" : ""}: `);
        const password = await passwordPrompt(email);
        if (password.length < 8) throw new Error(`Password for ${email} must be at least 8 characters`);

        if (existing) {
            await auth.api.adminUpdateUser({
                body: { userId: existing.id, data: { name: name.trim() || "Admin", role: "admin" } },
            });
            await auth.api.setUserPassword({ body: { userId: existing.id, newPassword: password } });
            await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: true } });
            console.log(`Updated admin: ${email}`);
        } else {
            const result = await auth.api.signUpEmail({ body: { email, password, name: name.trim() || "Admin" } });
            if (!result.user) throw new Error(`Could not create ${email}`);
            await prisma.user.update({ where: { id: result.user.id }, data: { role: "admin", emailVerified: true } });
            console.log(`Created admin: ${email}`);
        }
    }
} finally {
    rl.close();
    await prisma.$disconnect();
    await pool.end();
}
