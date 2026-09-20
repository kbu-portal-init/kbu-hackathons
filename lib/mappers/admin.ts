import type { AdminOverview } from "@/lib/contracts/admin";
export type AdminOverviewRecord = AdminOverview;
export function toAdminOverview(record: AdminOverviewRecord): AdminOverview {
    return { ...record };
}
