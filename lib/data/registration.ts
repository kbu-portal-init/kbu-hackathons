import "server-only";

import type { ListResult } from "@/lib/contracts/common";
import type { ListRegistrationsInput, RegistrationListItem } from "@/lib/contracts/registration";
import { toRegistrationListResult } from "@/lib/mappers/registration";
import prisma from "@/lib/prisma";

export async function listRegistrations(input: ListRegistrationsInput): Promise<ListResult<RegistrationListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    const where = { status: input.status };

    const [total, registrations] = await Promise.all([
        prisma.registration.count({ where }),
        prisma.registration.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                teamId: true,
                status: true,
                applicationNotes: true,
                submittedAt: true,
                withdrawnAt: true,
                createdAt: true,
                updatedAt: true,
                team: {
                    select: {
                        displayName: true,
                        loginName: true,
                        _count: { select: { members: true } },
                    },
                },
            },
        }),
    ]);

    return toRegistrationListResult(registrations, { page, pageSize }, total);
}
