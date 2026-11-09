import "server-only";

import type { TeamMemberCard } from "@/lib/contracts/team-members";
import type { TeamOverviewMember } from "@/lib/contracts/team-overview";
import prisma from "@/lib/prisma";

export async function getTeamMembersForCards(teamId: string): Promise<TeamMemberCard[]> {
    const members = await prisma.teamMember.findMany({
        where: { teamId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            name: true,
            role: true,
            studentEmail: true,
            imageUrl: true,
            cardUrl: true,
            cardShareToken: true,
        },
    });

    return members;
}

export async function getTeamMembersOverview(teamId: string): Promise<TeamOverviewMember[]> {
    const members = await prisma.teamMember.findMany({
        where: { teamId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            name: true,
            role: true,
            studentEmail: true,
            imageUrl: true,
            studentEmailVerifiedAt: true,
        },
    });

    return members.map(({ studentEmailVerifiedAt, ...member }) => ({
        ...member,
        verifiedAt: studentEmailVerifiedAt?.toISOString() ?? null,
    }));
}

export async function getTeamApprovalDate(teamId: string): Promise<string | null> {
    const review = await prisma.registrationReview.findFirst({
        where: { registration: { teamId }, decision: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
    });

    return review?.createdAt.toISOString() ?? null;
}
