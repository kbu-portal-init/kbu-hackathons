import type { AdminOverview } from "@/lib/contracts/admin";

export type AdminOverviewRecord = {
    organizerCount: number;
    teamCount: number;
    bannedAccountCount: number;
};

export function toAdminOverview(record: AdminOverviewRecord): AdminOverview {
    return {
        organizerCount: record.organizerCount,
        teamCount: record.teamCount,
        bannedAccountCount: record.bannedAccountCount,
    };
}
