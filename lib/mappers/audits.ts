import type { AuditLogListItem, ListAuditLogsInput } from "@/lib/contracts/audits";
import type { ListResult } from "@/lib/contracts/common";
export type AuditLogRecord = Omit<AuditLogListItem, "createdAt"> & { createdAt: Date };
export function toAuditLogListItem(record: AuditLogRecord): AuditLogListItem {
    return { ...record, createdAt: record.createdAt.toISOString() };
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
