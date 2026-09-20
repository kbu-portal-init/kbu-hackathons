import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { AuditLogListItem, ListAuditLogsInput } from "@/lib/contracts/audits";
import type { ListResult } from "@/lib/contracts/common";
import { toAuditLogListResult } from "@/lib/mappers/audits";
import prisma from "@/lib/prisma";

export async function listAuditLogs(input: ListAuditLogsInput): Promise<ListResult<AuditLogListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    const selectedUser =
        input.userId && input.userKind
            ? input.userKind === "user"
                ? { actorId: input.userId }
                : { targetId: input.userId }
            : {};

    const where: Prisma.AuditLogWhereInput = { ...selectedUser, ...(input.action ? { action: input.action } : {}) };

    const [total, records] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                action: true,
                targetType: true,
                targetId: true,
                details: true,
                createdAt: true,
                actor: { select: { id: true, name: true, email: true, role: true } },
            },
        }),
    ]);

    return toAuditLogListResult(records, input, total);
}
