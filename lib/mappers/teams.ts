import type { ListResult, PageInput } from "@/lib/contracts/common";
import type { RegistrationStatusValue, TeamSummary } from "@/lib/contracts/teams";

export type TeamRecord = {
    id: string;
    loginName: string;
    displayName: string;
    imageUrl: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    _count: { members: number };
    registration: { status: RegistrationStatusValue } | null;
    submission: { title: string } | null;
};

export function toTeamSummary(record: TeamRecord): TeamSummary {
    return {
        id: record.id,
        loginName: record.loginName,
        displayName: record.displayName,
        imageUrl: record.imageUrl,
        memberCount: record._count.members,
        registrationStatus: record.registration?.status ?? null,
        submissionTitle: record.submission?.title ?? null,
        archived: record.archivedAt !== null,
        createdAt: record.createdAt.toISOString(),
    };
}

export function toTeamSummaryListResult(
    records: TeamRecord[],
    input: PageInput,
    total: number,
): ListResult<TeamSummary> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    return {
        items: records.map(toTeamSummary),
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}
