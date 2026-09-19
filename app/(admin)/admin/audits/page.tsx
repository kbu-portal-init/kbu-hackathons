import Link from "next/link";
import { PaginationFooter } from "@/components/pagination-footer";
import { requireAdmin } from "@/lib/auth/guards";
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
    await requireAdmin();

    const params = await searchParams;

    const data = await listAuditLogs({
        page: Number(params.page ?? 1),
        pageSize: Number(params.pageSize ?? 20),
        userId: params.userId,
        userKind: params.userKind,
        action: params.action,
    });

    const { items, meta } = data;

    const pageHref = (page: number) => {
        const query = new URLSearchParams({ page: String(page), pageSize: String(meta.pageSize) });
        if (params.userId) query.set("userId", params.userId);
        if (params.userKind) query.set("userKind", params.userKind);
        if (params.action) query.set("action", params.action);
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
            <AuditFilters userId={params.userId} userKind={params.userKind} action={params.action} />
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
