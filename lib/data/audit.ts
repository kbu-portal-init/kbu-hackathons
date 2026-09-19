import "server-only";

import type { AuditLogListItem, ListAuditLogsInput } from "@/lib/contracts/audit";
import type { ListResult } from "@/lib/contracts/common";
import { toAuditLogListResult } from "@/lib/mappers/audit";
import prisma from "@/lib/prisma";

export async function listAuditLogs(input: ListAuditLogsInput): Promise<ListResult<AuditLogListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    const where = {
        ...(input.action ? { action: input.action } : {}),
        ...(input.targetType ? { targetType: input.targetType } : {}),
        ...(input.actorId ? { actorId: input.actorId } : {}),
    };

    const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { actor: { select: { name: true } } },
        }),
    ]);

    return toAuditLogListResult(logs, { page, pageSize }, total);
}

export async function listAuditActions(): Promise<string[]> {
    const rows = await prisma.auditLog.findMany({
        where: {},
        distinct: ["action"],
        select: { action: true },
        orderBy: { action: "asc" },
    });
    return rows.map((row) => row.action);
}
