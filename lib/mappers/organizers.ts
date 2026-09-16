import type { ListResult } from "@/lib/contracts/common";
import type { ListOrganizersInput, OrganizerListItem } from "@/lib/contracts/organizers";

export type OrganizerRecord = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
};

export function toOrganizerListItem(record: OrganizerRecord): OrganizerListItem {
    return {
        id: record.id,
        name: record.name,
        email: record.email,
        createdAt: record.createdAt.toISOString(),
        banned: record.banned,
        banReason: record.banReason,
        banExpires: record.banExpires?.toISOString() ?? null,
    };
}

export function toOrganizerListResult(
    records: OrganizerRecord[],
    input: ListOrganizersInput,
    total: number,
): ListResult<OrganizerListItem> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    return {
        items: records.map(toOrganizerListItem),
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}
