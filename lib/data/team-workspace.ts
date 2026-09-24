import "server-only";

import type { TeamWorkspaceView } from "@/lib/contracts/team-workspace";
import { toTeamWorkspaceView } from "@/lib/mappers/team-workspace";
import prisma from "@/lib/prisma";

export async function getTeamWorkspace(teamId: string): Promise<TeamWorkspaceView | null> {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            id: true,
            loginName: true,
            displayName: true,
            imageUrl: true,
            archivedAt: true,
            createdAt: true,
            _count: { select: { members: true } },
            registration: { select: { status: true } },
        },
    });

    if (!team) return null;

    const [members, submission] = await Promise.all([
        prisma.teamMember.findMany({
            where: { teamId },
            orderBy: [{ role: "asc" }, { createdAt: "asc" }],
            select: {
                id: true,
                name: true,
                studentEmail: true,
                role: true,
                studentEmailVerifiedAt: true,
                createdAt: true,
            },
        }),
        prisma.submission.findUnique({
            where: { teamId },
            select: {
                id: true,
                title: true,
                description: true,
                repositoryUrl: true,
                demoUrl: true,
                presentationUrl: true,
                submittedAt: true,
                updatedAt: true,
            },
        }),
    ]);

    return toTeamWorkspaceView(team, members, submission);
}
