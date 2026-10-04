import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { PaginationFooter } from "@/components/pagination-footer";
import { listAuditLogsSchema } from "@/lib/contracts/audits";
import { listAuditLogs } from "@/lib/data/audits";
import { AuditFilters } from "./_components/audit-filters";
import { AuditLogTable } from "./_components/audit-log-table";

type AuditSearchParams = {
    page?: string;
    pageSize?: string;
    userId?: string;
    userKind?: "user" | "teamMember";
    action?: string;
};

export default function AdminAuditsPage({ searchParams }: { searchParams: Promise<AuditSearchParams> }) {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Administrator access"
                title="Audit logs"
                description="Review and permanently delete administrative activity records."
            />
            <Suspense fallback={<DashboardListSkeleton />}>
                <AuditLogContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function AuditLogContent({ searchParams }: { searchParams: Promise<AuditSearchParams> }) {
    const params = await searchParams;

    const parsedParams = listAuditLogsSchema.safeParse(params);
    const filters = parsedParams.success ? parsedParams.data : listAuditLogsSchema.parse({});
    const data = await listAuditLogs(filters);

    const { items, meta } = data;

    const pageHref = (page: number) => {
        const query = new URLSearchParams({ page: String(page), pageSize: String(meta.pageSize) });
        if (filters.userId) query.set("userId", filters.userId);
        if (filters.userKind) query.set("userKind", filters.userKind);
        if (filters.action) query.set("action", filters.action);
        return `/admin/audits?${query}`;
    };

    return (
        <>
            <AuditFilters userId={filters.userId} userKind={filters.userKind} action={filters.action} />
            <AuditLogTable items={items} />
            <PaginationFooter
                page={meta.page}
                pageSize={meta.pageSize}
                total={meta.total}
                itemsShown={items.length}
                hasNextPage={meta.hasNextPage}
                getPageHref={pageHref}
            />
        </>
    );
}
