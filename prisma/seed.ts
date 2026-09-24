import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { Pool } from "pg";
import { PrismaClient, TeamMemberRole } from "@/generated/prisma/client";

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

const now = Date.now();
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const eventDates = {
    // Opened exactly 7 days ago
    registrationOpensAt: new Date(now - 7 * MS_PER_DAY),

    // Closes in 35 days (5 weeks from today)
    registrationClosesAt: new Date(now + 35 * MS_PER_DAY),

    // Event starts 13 days after registration closes (48 days from now)
    startsAt: new Date(now + 48 * MS_PER_DAY),

    // 3-day event ending on day 50
    endsAt: new Date(now + 50 * MS_PER_DAY),

    // Submissions open when event starts
    submissionOpensAt: new Date(now + 48 * MS_PER_DAY),

    // Submission deadline 5 hours before event ends
    submissionDeadline: new Date(now + 50 * MS_PER_DAY - 5 * 60 * 60 * 1000),
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
        prisma.announcement.deleteMany(),
        prisma.session.deleteMany(),
        prisma.account.deleteMany(),
        prisma.verification.deleteMany(),
        prisma.user.deleteMany(),
        prisma.eventSettings.deleteMany(),
    ]);

    const adminUser = await createUser({ email: "admin@ms.kbu.ac.th", password: "adminpassword", name: "Super Admin" });
    await prisma.user.update({ where: { id: adminUser.id }, data: { role: "admin", emailVerified: true } });
    const organizerUsers = await Promise.all([
        createUser({ email: "organizer@ms.kbu.ac.th", password: "organizerpassword", name: "Primary Organizer" }),
        createUser({ email: "organizer2@ms.kbu.ac.th", password: "organizerpassword", name: "Secondary Organizer" }),
    ]);
    await prisma.user.updateMany({
        where: { id: { in: organizerUsers.map((user) => user.id) } },
        data: { role: "organizer", emailVerified: true },
    });

    await prisma.eventSettings.create({
        data: {
            title: "KBU Innovation Sprint 2026",
            description: "Build practical solutions for the KBU community.",
            venue: "KBU Innovation Lab",
            imageUrls: [],
            ...eventDates,
            maxTeams: 50,
            minTeamSize: 2,
            maxTeamSize: 5,
        },
    });

    await prisma.announcement.createMany({
        data: [
            {
                title: "KBU Innovation Sprint 2026 is open",
                content:
                    "Registration is now open. Form your team, review the challenge details, and submit your application before the registration deadline.",
                imageUrl:
                    "https://pub-ab7b105929754ba195b59fb0082dca50.r2.dev/uploads/events/72e392a0-9fce-405e-99dc-01d93e4fd51f.webp",
                status: "PUBLISHED",
                publishedAt: new Date("2026-01-01T00:00:00.000Z"),
                createdById: adminUser.id,
            },
            {
                title: "Important registration reminder",
                content:
                    "Teams must have between 2 and 5 members. Make sure every member is listed with a valid student email before submitting your registration.",
                imageUrl:
                    "https://pub-ab7b105929754ba195b59fb0082dca50.r2.dev/uploads/events/72e392a0-9fce-405e-99dc-01d93e4fd51f.webp",
                status: "PUBLISHED",
                publishedAt: new Date("2026-01-15T09:00:00.000Z"),
                createdById: adminUser.id,
            },
            {
                title: "Hackathon orientation details",
                content: "Orientation details will be shared with approved teams before the event begins.",
                imageUrl:
                    "https://pub-ab7b105929754ba195b59fb0082dca50.r2.dev/uploads/events/72e392a0-9fce-405e-99dc-01d93e4fd51f.webp",
                status: "PUBLISHED",
                publishedAt: new Date("2026-01-20T09:00:00.000Z"),
                createdById: adminUser.id,
            },
            ...[
                [
                    "Challenge theme announcement",
                    "This year's challenge focuses on practical solutions that improve the KBU community experience.",
                ],
                [
                    "How to form a strong team",
                    "Bring together complementary skills in technology, design, research, and presentation to build a well-rounded team.",
                ],
                [
                    "Student eligibility reminder",
                    "All team members should review the eligibility requirements and keep their student information up to date.",
                ],
                [
                    "Registration checklist",
                    "Before submitting, verify your team name, member roster, application notes, and contact details.",
                ],
                [
                    "Meet the organizing team",
                    "Our organizers are ready to help teams understand the rules, schedule, and submission requirements.",
                ],
                [
                    "Workshop schedule coming soon",
                    "Practical workshops and mentoring sessions will be announced ahead of the main event.",
                ],
                [
                    "Prepare your project idea",
                    "Start by identifying a real problem, understanding its users, and defining a measurable outcome.",
                ],
                [
                    "Mentor support for teams",
                    "Approved teams will have opportunities to receive feedback from mentors during the sprint.",
                ],
                [
                    "Design for the KBU community",
                    "Keep accessibility, usability, and the needs of diverse KBU users at the center of your solution.",
                ],
                [
                    "Submission requirements",
                    "Teams should prepare a clear project description, repository link, and final presentation before the deadline.",
                ],
                [
                    "Registration deadline reminder",
                    "Do not wait until the last day. Submit your complete team registration before registration closes.",
                ],
                [
                    "What happens after registration",
                    "Organizers will review applications and notify teams about their registration status.",
                ],
                [
                    "Build week preparation",
                    "Set up your tools, divide responsibilities, and agree on a communication plan before the event starts.",
                ],
                [
                    "Bring your best ideas",
                    "The sprint is an opportunity to turn a thoughtful idea into a useful prototype with your teammates.",
                ],
                [
                    "Event venue information",
                    "The KBU Innovation Lab will host the main activities, workshops, and final presentations.",
                ],
                [
                    "Team account reminder",
                    "Use your team account to review your registration, manage your roster, and access participant updates.",
                ],
                [
                    "Final presentation guidance",
                    "Tell a clear story: explain the problem, demonstrate your solution, and share what you learned.",
                ],
                [
                    "Keep your roster updated",
                    "Make sure every participating member is listed correctly and completes the required verification.",
                ],
                [
                    "Community impact matters",
                    "Strong projects connect technical decisions to meaningful benefits for students and the wider KBU community.",
                ],
                [
                    "Countdown to the sprint",
                    "The event is approaching. Review the schedule and make sure your team is ready to collaborate.",
                ],
                [
                    "Good luck to all teams",
                    "We look forward to seeing the creativity, teamwork, and practical impact of every participating team.",
                ],
            ].map(([title, content], index) => ({
                title,
                content,
                imageUrl:
                    "https://pub-ab7b105929754ba195b59fb0082dca50.r2.dev/uploads/events/72e392a0-9fce-405e-99dc-01d93e4fd51f.webp",
                status: "PUBLISHED" as const,
                publishedAt: new Date(Date.UTC(2026, 1, 1 + index, 9, 0, 0)),
                createdById: adminUser.id,
            })),
        ],
    });

    const teams = await Promise.all([
        createTeam({
            loginName: "team-orbit",
            displayName: "Team Orbit",
            status: "APPROVED",
            adminUserId: adminUser.id,
            submission: true,
            studentEmailIds: ["660000000001", "660000000002", "660000000003"],
        }),
        createTeam({
            loginName: "team-pulse",
            displayName: "Team Pulse",
            status: "PENDING",
            adminUserId: adminUser.id,
            submission: false,
            studentEmailIds: ["660000000004", "660000000005", "660000000006"],
        }),
        createTeam({
            loginName: "team-nova",
            displayName: "Team Nova",
            status: "REJECTED",
            adminUserId: adminUser.id,
            submission: false,
            studentEmailIds: ["660000000007", "660000000008", "660000000009"],
        }),
    ]);

    // console.log(`✅ Seeded admin, event settings, and ${teams.length} teams.`);
    const teamUsers = await prisma.user.findMany({ where: { role: "team" }, select: { id: true } });
    const teamMembers = await prisma.teamMember.findMany({ select: { id: true } });
    const auditActions = [
        "ACCOUNT_BANNED",
        "ACCOUNT_UNBANNED",
        "EMAIL_SENT",
        "EMAIL_SEND_FAILED",
        "EVENT_SETTINGS_UPSERTED",
        "ORGANIZER_ACCOUNT_CREATED",
        "STUDENT_EMAIL_VERIFICATION",
    ];
    await prisma.auditLog.createMany({
        data: Array.from({ length: 40 }, (_, index) => {
            const action = auditActions[index % auditActions.length];
            const actorId =
                index % 4 === 0
                    ? adminUser.id
                    : index % 4 === 1
                      ? (organizerUsers[(index - 1) % organizerUsers.length]?.id ?? adminUser.id)
                      : (teamUsers[(index - 1) % teamUsers.length]?.id ?? adminUser.id);
            const member = teamMembers[index % teamMembers.length];
            const target =
                index % 5 === 0
                    ? { targetType: "EventSettings", targetId: "1" }
                    : index % 3 === 0
                      ? { targetType: "TeamMember", targetId: member.id }
                      : { targetType: "User", targetId: teamUsers[index % teamUsers.length]?.id ?? adminUser.id };
            return {
                actorId,
                action,
                targetType: target.targetType,
                targetId: target.targetId,
                details: { seeded: true, sequence: index + 1, source: "development-seed" },
                createdAt: new Date(Date.UTC(2026, 1, 1, 9, index, 0)),
            };
        }),
    });
    console.log(`✅ Seeded admin, event settings, and ${teams.length} teams.`);
    console.log("🔐 Admin login: admin@ms.kbu.ac.th / adminpassword");
    console.log("🔐 Organizer login: organizer@ms.kbu.ac.th / organizerpassword");
    console.log("🔐 Organizer login: organizer2@ms.kbu.ac.th / organizerpassword");
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
    studentEmailIds: [string, string, string];
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
    const verifiedAt = input.status === "APPROVED" ? new Date("2026-02-10T12:00:00.000Z") : null;
    const leader = await prisma.teamMember.create({
        data: {
            teamId: team.id,
            name: `${input.displayName} Leader`,
            studentEmail: `u${input.studentEmailIds[0]}@ms.kbu.ac.th`,
            role: TeamMemberRole.LEADER,
            studentEmailVerifiedAt: verifiedAt,
        },
    });
    await prisma.teamMember.createMany({
        data: [
            {
                teamId: team.id,
                name: `${input.displayName} Developer`,
                studentEmail: `u${input.studentEmailIds[1]}@ms.kbu.ac.th`,
                role: "DEVELOPER",
                studentEmailVerifiedAt: verifiedAt,
            },
            {
                teamId: team.id,
                name: `${input.displayName} Designer`,
                studentEmail: `u${input.studentEmailIds[2]}@ms.kbu.ac.th`,
                role: "DESIGNER",
                studentEmailVerifiedAt: verifiedAt,
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
