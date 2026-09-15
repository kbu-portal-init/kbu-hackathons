import "server-only";

import type { ListResult } from "@/lib/contracts/common";
import type { ListOrganizersInput, OrganizerListItem } from "@/lib/contracts/organizers";
import { toOrganizerListItem, toOrganizerListResult } from "@/lib/mappers/organizers";
import prisma from "@/lib/prisma";

export async function listOrganizers(input: ListOrganizersInput): Promise<ListResult<OrganizerListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const where = { role: "organizer" };
    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                banned: true,
                banReason: true,
                banExpires: true,
            },
        }),
    ]);
    return toOrganizerListResult(users, { page, pageSize }, total);
}

export async function getOrganizer(userId: string): Promise<OrganizerListItem | null> {
    const user = await prisma.user.findFirst({
        where: { id: userId, role: "organizer" },
        select: { id: true, name: true, email: true, createdAt: true, banned: true, banReason: true, banExpires: true },
    });
    return user ? toOrganizerListItem(user) : null;
}
