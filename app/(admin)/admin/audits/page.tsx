import Link from "next/link";
import { PaginationFooter } from "@/components/pagination-footer";
import { listAuditLogsSchema } from "@/lib/contracts/audits";
import { listAuditLogs } from "@/lib/data/audits";
import { AuditFilters } from "./_components/audit-filters";
import { AuditLogTable } from "./_components/audit-log-table";

export default async function AdminAuditsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        userId?: string;
        userKind?: "user" | "teamMember";
        action?: string;
    }>;
}) {
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
        <main className="flex-1 space-y-8 p-6 lg:p-8">
            <div>
                <Link href="/admin" className="text-sm font-medium text-orange-600">
                    ← Dashboard
                </Link>
                <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-orange-600">Administrator</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Audit logs</h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                    Review and permanently delete administrative activity records.
                </p>
            </div>
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
        </main>
    );
}
