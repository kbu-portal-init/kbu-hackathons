import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    plugins: [
        username({
            immutableUsername: true,
            usernameValidator: (value) => /^[a-zA-Z0-9_.-]+$/.test(value),
        }),
        admin(),
    ],
    user: { additionalFields: { role: { type: "string", required: false, defaultValue: "team", input: false } } },
});

const eventDates = {
    registrationOpensAt: new Date("2026-01-01T00:00:00.000Z"),
    registrationClosesAt: new Date("2026-02-15T23:59:59.000Z"),
    startsAt: new Date("2026-03-01T09:00:00.000Z"),
    endsAt: new Date("2026-03-03T17:00:00.000Z"),
    submissionOpensAt: new Date("2026-03-01T09:00:00.000Z"),
    submissionDeadline: new Date("2026-03-03T12:00:00.000Z"),
};

async function main() {
    console.log("🌱 Resetting development data...");
    await prisma.$transaction([
        prisma.studentEmailVerification.deleteMany(),
        prisma.registrationReview.deleteMany(),
        prisma.submission.deleteMany(),
        prisma.registration.deleteMany(),
        prisma.teamMember.deleteMany(),
        prisma.team.deleteMany(),
        prisma.auditLog.deleteMany(),
        prisma.session.deleteMany(),
        prisma.account.deleteMany(),
        prisma.verification.deleteMany(),
        prisma.user.deleteMany(),
        prisma.eventSettings.deleteMany(),
    ]);

    const adminUser = await createUser({ email: "admin@ms.kbu.ac.th", password: "adminpassword", name: "Super Admin" });
    await prisma.user.update({ where: { id: adminUser.id }, data: { role: "admin", emailVerified: true } });

    await prisma.eventSettings.create({
        data: {
            title: "KBU Innovation Sprint 2026",
            description: "Build practical solutions for the KBU community.",
            venue: "KBU Innovation Lab",
            imageUrls: [],
            promoUrl: "https://example.com/kbu-innovation-sprint",
            ...eventDates,
            maxTeams: 50,
            minTeamSize: 2,
            maxTeamSize: 5,
        },
    });

    const teams = await Promise.all([
        createTeam({
            loginName: "team-orbit",
            displayName: "Team Orbit",
            status: "APPROVED",
            adminUserId: adminUser.id,
            submission: true,
        }),
        createTeam({
            loginName: "team-pulse",
            displayName: "Team Pulse",
            status: "PENDING",
            adminUserId: adminUser.id,
            submission: false,
        }),
        createTeam({
            loginName: "team-nova",
            displayName: "Team Nova",
            status: "REJECTED",
            adminUserId: adminUser.id,
            submission: false,
        }),
    ]);

    console.log(`✅ Seeded admin, event settings, and ${teams.length} teams.`);
    console.log("🔐 Admin login: admin@ms.kbu.ac.th / adminpassword");
    console.log("🔐 Team login password for all fixtures: teampassword");
    console.log("🎉 Seed finished!");
}

async function createUser(input: { email: string; password: string; name: string; username?: string }) {
    await auth.api.signUpEmail({ body: { email: input.email, password: input.password, name: input.name } });
    return prisma.user.update({
        where: { email: input.email },
        data: {
            emailVerified: true,
            ...(input.username ? { username: input.username, displayUsername: input.username } : {}),
        },
    });
}

async function createTeam(input: {
    loginName: string;
    displayName: string;
    status: "APPROVED" | "PENDING" | "REJECTED";
    adminUserId: string;
    submission: boolean;
}) {
    const user = await createUser({
        email: `${input.loginName}@team.kbu.internal`,
        password: "teampassword",
        name: input.displayName,
        username: input.loginName,
    });
    await prisma.user.update({
        where: { id: user.id },
        data: { role: "team", emailVerified: true },
    });
    const team = await prisma.team.create({
        data: { loginName: input.loginName, displayName: input.displayName, userId: user.id },
    });
    const leader = await prisma.teamMember.create({
        data: {
            teamId: team.id,
            name: `${input.displayName} Leader`,
            studentEmail: `${input.loginName}.leader@ms.kbu.ac.th`,
            role: "LEADER",
        },
    });
    await prisma.teamMember.createMany({
        data: [
            {
                teamId: team.id,
                name: `${input.displayName} Developer`,
                studentEmail: `${input.loginName}.developer@ms.kbu.ac.th`,
                role: "DEVELOPER",
            },
            {
                teamId: team.id,
                name: `${input.displayName} Designer`,
                studentEmail: `${input.loginName}.designer@ms.kbu.ac.th`,
                role: "DESIGNER",
            },
        ],
    });
    const registration = await prisma.registration.create({
        data: {
            teamId: team.id,
            status: input.status,
            applicationNotes: `Development fixture for ${input.displayName}`,
            submittedAt: new Date("2026-02-10T12:00:00.000Z"),
        },
    });
    await prisma.registrationReview.create({
        data: {
            registrationId: registration.id,
            reviewerId: input.adminUserId,
            decision: input.status === "APPROVED" ? "APPROVED" : input.status === "REJECTED" ? "REJECTED" : "REOPENED",
            reason: "Development fixture review",
        },
    });
    if (input.submission)
        await prisma.submission.create({
            data: {
                teamId: team.id,
                title: "Community Connection Platform",
                description: "A development submission for the seeded approved team.",
                repositoryUrl: "https://github.com/example/team-orbit",
                submittedAt: new Date("2026-03-02T12:00:00.000Z"),
            },
        });
    return { team, leader };
}

main().finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
