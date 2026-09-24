import type { ListResult, PageInput } from "@/lib/contracts/common";
import type { RegistrationListItem } from "@/lib/contracts/registration";

export type RegistrationRecord = {
    id: string;
    teamId: string;
    status: string;
    applicationNotes: string | null;
    submittedAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    team: {
        displayName: string;
        loginName: string;
        _count: { members: number };
    };
};

export function toRegistrationListItem(record: RegistrationRecord): RegistrationListItem {
    return {
        id: record.id,
        teamName: record.team.displayName,
        loginName: record.team.loginName,
        status: record.status,
        memberCount: record.team._count.members,
        leaderName: record.team.displayName,
        leaderEmail: record.team.loginName,
        submittedAt: record.submittedAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
    };
}

export function toRegistrationListResult(
    records: RegistrationRecord[],
    input: PageInput,
    total: number,
): ListResult<RegistrationListItem> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    return {
        items: records.map(toRegistrationListItem),
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}
