import type { AuditLogListItem, ListAuditLogsInput } from "@/lib/contracts/audit";
import type { ListResult } from "@/lib/contracts/common";

export type AuditLogRecord = {
    id: string;
    actorId: string | null;
    action: string;
    targetType: string;
    targetId: string;
    details: unknown;
    createdAt: Date;
    actor: { name: string | null } | null;
};

export function toAuditLogListItem(record: AuditLogRecord): AuditLogListItem {
    return {
        id: record.id,
        actorId: record.actorId,
        actorName: record.actor?.name ?? null,
        action: record.action,
        targetType: record.targetType,
        targetId: record.targetId,
        details: record.details === null || record.details === undefined ? null : JSON.stringify(record.details),
        createdAt: record.createdAt.toISOString(),
    };
}

export function toAuditLogListResult(
    records: AuditLogRecord[],
    input: ListAuditLogsInput,
    total: number,
): ListResult<AuditLogListItem> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    return {
        items: records.map(toAuditLogListItem),
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}
