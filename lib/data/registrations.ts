import "server-only";

import type { ListResult } from "@/lib/contracts/common";
import type { ListRegistrationsInput, RegistrationDetailDTO, RegistrationListItem } from "@/lib/contracts/registration";
import { toRegistrationDetail, toRegistrationListItem } from "@/lib/mappers/registrations";
import prisma from "@/lib/prisma";

export async function listRegistrations(input: ListRegistrationsInput): Promise<ListResult<RegistrationListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const where = input.status ? { status: input.status } : {};

    const [total, records] = await Promise.all([
        prisma.registration.count({ where }),
        prisma.registration.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                team: {
                    select: {
                        displayName: true,
                        loginName: true,
                        members: {
                            select: { id: true, name: true, role: true, studentEmail: true },
                        },
                    },
                },
                reviews: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { decision: true },
                },
            },
        }),
    ]);

    const items = records.map((r) => {
        const leader = r.team.members.find((m) => m.role === "LEADER") ?? r.team.members[0];
        return toRegistrationListItem({
            id: r.id,
            status: r.status,
            submittedAt: r.submittedAt,
            createdAt: r.createdAt,
            teamDisplayName: r.team.displayName,
            teamLoginName: r.team.loginName,
            memberCount: r.team.members.length,
            leaderName: leader?.name ?? "",
            leaderEmail: leader?.studentEmail ?? "",
        });
    });

    return { items, meta: { total, page, pageSize, hasNextPage: page * pageSize < total } };
}

export async function getRegistrationDetail(registrationId: string): Promise<RegistrationDetailDTO | null> {
    const record = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
            team: {
                select: {
                    displayName: true,
                    loginName: true,
                    members: {
                        select: { id: true, name: true, role: true, studentEmail: true },
                        orderBy: { createdAt: "asc" },
                    },
                },
            },
            reviews: {
                orderBy: { createdAt: "desc" },
                select: { id: true, decision: true, reason: true, createdAt: true },
            },
        },
    });

    if (!record) return null;

    const leader = record.team.members.find((m) => m.role === "LEADER") ?? record.team.members[0];

    return toRegistrationDetail({
        id: record.id,
        status: record.status,
        applicationNotes: record.applicationNotes,
        submittedAt: record.submittedAt,
        withdrawnAt: record.withdrawnAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        teamDisplayName: record.team.displayName,
        teamLoginName: record.team.loginName,
        memberCount: record.team.members.length,
        leaderName: leader?.name ?? "",
        leaderEmail: leader?.studentEmail ?? "",
        members: record.team.members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            email: m.studentEmail,
        })),
        reviews: record.reviews.map((rv) => ({
            id: rv.id,
            decision: rv.decision,
            reason: rv.reason,
            createdAt: rv.createdAt,
        })),
    });
}

export async function countApprovedTeams(): Promise<number> {
    return prisma.registration.count({ where: { status: "APPROVED" } });
}

export async function getRegistrationWithTeam(registrationId: string) {
    return prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
            team: {
                include: {
                    members: { orderBy: { createdAt: "asc" } },
                },
            },
        },
    });
}

export async function getRegistrationByTeamId(teamId: string) {
    return prisma.registration.findFirst({
        where: { teamId },
        include: {
            team: {
                include: {
                    members: { orderBy: { createdAt: "asc" } },
                },
            },
        },
    });
}
