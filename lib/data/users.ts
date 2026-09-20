import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { ListUsersInput, UserDirectoryResult } from "@/lib/contracts/users";
import prisma from "@/lib/prisma";

export async function listUsers(input: ListUsersInput): Promise<UserDirectoryResult> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 200;
    const search = input.search?.trim() ?? "";
    const pattern = `%${search}%`;
    const searchClause = search
        ? Prisma.sql`WHERE id ILIKE ${pattern} OR name ILIKE ${pattern} OR email ILIKE ${pattern}`
        : Prisma.empty;
    const memberSearchClause = search
        ? Prisma.sql`WHERE id ILIKE ${pattern} OR name ILIKE ${pattern} OR "studentEmail" ILIKE ${pattern}`
        : Prisma.empty;

    const [countRows, items] = await Promise.all([
        prisma.$queryRaw<[{ total: bigint }]>`
            SELECT COUNT(*)::bigint AS total
            FROM (
                SELECT id FROM "user" ${searchClause}
                UNION ALL
                SELECT id FROM team_member ${memberSearchClause}
            ) directory
        `,
        prisma.$queryRaw<UserDirectoryResult["items"]>`
            SELECT id, name, email, kind
            FROM (
                SELECT id, name, email, 'user' AS kind FROM "user" ${searchClause}
                UNION ALL
                SELECT id, name, "studentEmail" AS email, 'teamMember' AS kind FROM team_member ${memberSearchClause}
            ) directory
            ORDER BY name ASC, id ASC, kind ASC
            LIMIT ${pageSize}
            OFFSET ${(page - 1) * pageSize}
        `,
    ]);

    const total = Number(countRows[0]?.total ?? BigInt(0));
    return {
        items,
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}
