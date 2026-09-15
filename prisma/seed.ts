import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting seed...");

    // ========== 1. Create Admin ==========
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
    }

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: "Super Admin",
            },
        });

        // Update role + create AdminProfile
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                role: "admin",
                emailVerified: true,
                adminProfile: {
                    create: {
                        // add any admin-specific fields here later
                    },
                },
            },
        });

        console.log("✅ Admin created:", adminEmail);
    } else {
        console.log("ℹ️ Admin already exists");
    }

    console.log("🎉 Seed finished!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
