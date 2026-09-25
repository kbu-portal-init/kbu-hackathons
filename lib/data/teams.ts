import "server-only";

import type { ListResult } from "@/lib/contracts/common";
import type { ListTeamsInput, TeamDetailDTO, TeamListItem } from "@/lib/contracts/teams";
import { toTeamDetail, toTeamListItem } from "@/lib/mappers/teams";
import prisma from "@/lib/prisma";

const teamListInclude = {
    user: { select: { banned: true, banReason: true, banExpires: true } },
    members: { select: { id: true } },
    submission: { select: { id: true } },
    registration: { select: { status: true } },
} as const;

export async function listTeams(input: ListTeamsInput): Promise<ListResult<TeamListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const now = new Date();
    const where = {
        registration: { status: "APPROVED" as const },
        ...(input.status === "BANNED"
            ? { user: { banned: true, OR: [{ banExpires: null }, { banExpires: { gt: now } }] } }
            : input.status === "ACTIVE"
              ? { user: { OR: [{ banned: false }, { banned: true, banExpires: { lte: now } }] } }
              : {}),
    };

    const [total, records] = await Promise.all([
        prisma.team.count({ where }),
        prisma.team.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: teamListInclude,
        }),
    ]);

    return {
        items: records.map(toTeamListItem),
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}

export async function getTeamDetail(teamId: string): Promise<TeamDetailDTO | null> {
    const record = await prisma.team.findFirst({
        where: { id: teamId, registration: { status: "APPROVED" } },
        include: {
            user: { select: { banned: true, banReason: true, banExpires: true } },
            members: {
                select: {
                    id: true,
                    name: true,
                    studentEmail: true,
                    role: true,
                    imageUrl: true,
                    studentEmailVerifiedAt: true,
                },
                orderBy: { createdAt: "asc" },
            },
            submission: true,
            registration: {
                include: {
                    reviews: {
                        orderBy: { createdAt: "desc" },
                        select: { id: true, decision: true, reason: true, createdAt: true },
                    },
                },
            },
        },
    });

    return record ? toTeamDetail(record) : null;
}
