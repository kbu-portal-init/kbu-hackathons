import type { TeamMemberCard } from "@/lib/contracts/team-members";
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
