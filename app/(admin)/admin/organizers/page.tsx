import { Suspense } from "react";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { PaginationFooter } from "@/components/pagination-footer";
import { listOrganizers } from "@/lib/data/organizers";
import { OrganizerManagement } from "./_components/organizer-management";

export default function AdminOrganizersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
    return (
        <main className="space-y-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Organizers</h1>
                    <p className="mt-2 text-muted-foreground">Manage organizer accounts and elevated access.</p>
                </div>
            </div>
            <Suspense fallback={<DashboardListSkeleton />}>
                <OrganizerContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function OrganizerContent({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
    const params = await searchParams;

    const data = await listOrganizers({ page: Number(params.page ?? 1), pageSize: Number(params.pageSize ?? 20) });
    const { items, meta } = data;

    const pageHref = (page: number) => `/admin/organizers?page=${page}&pageSize=${meta.pageSize}`;

    return (
        <>
            <OrganizerManagement items={items} />
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
