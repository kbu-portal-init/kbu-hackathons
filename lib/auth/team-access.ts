import "server-only";

import prisma from "@/lib/prisma";

type TeamAccessRecord = {
    role: string;
    team: {
        archivedAt: Date | null;
        registration: { status: string } | null;
    } | null;
};

export function isApprovedTeamAccount(user: TeamAccessRecord | null | undefined) {
    return (
        user?.role === "team" &&
        user.team !== null &&
        user.team.archivedAt === null &&
        user.team.registration?.status === "APPROVED"
    );
}

export async function findTeamAccountByUsername(username: string) {
    return prisma.user.findFirst({
        where: { username: username.toLowerCase(), role: "team" },
        select: {
            id: true,
            email: true,
            role: true,
            team: {
                select: {
                    archivedAt: true,
                    registration: { select: { status: true } },
                    members: {
                        where: { role: "LEADER", studentEmailVerifiedAt: { not: null } },
                        select: { studentEmail: true },
                        take: 1,
                    },
                },
            },
        },
    });
}
