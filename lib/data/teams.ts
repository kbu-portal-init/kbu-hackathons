import "server-only";

import type { ListResult } from "@/lib/contracts/common";
import type { ListTeamsInput, TeamSummary } from "@/lib/contracts/teams";
import { toTeamSummaryListResult } from "@/lib/mappers/teams";
import prisma from "@/lib/prisma";

export async function listTeams(input: ListTeamsInput): Promise<ListResult<TeamSummary>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    const where = {
        archivedAt: null,
        ...(input.status && input.status !== "all"
            ? { registration: { status: input.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" } }
            : {}),
    };

    const [total, teams] = await Promise.all([
        prisma.team.count({ where }),
        prisma.team.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                loginName: true,
                displayName: true,
                imageUrl: true,
                archivedAt: true,
                createdAt: true,
                _count: { select: { members: true } },
                registration: { select: { status: true } },
                submission: { select: { title: true } },
            },
        }),
    ]);

    return toTeamSummaryListResult(teams, { page, pageSize }, total);
}
