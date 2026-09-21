import Link from "next/link";
import { PaginationFooter } from "@/components/pagination-footer";
import { listOrganizers } from "@/lib/data/organizers";
import { OrganizerManagement } from "./_components/organizer-management";

export default async function AdminOrganizersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
    const params = await searchParams;

    const data = await listOrganizers({ page: Number(params.page ?? 1), pageSize: Number(params.pageSize ?? 20) });
    const { items, meta } = data;

    const pageHref = (page: number) => `/admin/organizers?page=${page}&pageSize=${meta.pageSize}`;

    return (
        <main className="space-y-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <Link href="/admin" className="text-sm font-medium text-cyan-600">
                        ← Dashboard
                    </Link>
                    <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-cyan-600">Administrator</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Organizers</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                        Manage organizer accounts and elevated access.
                    </p>
                </div>
            </div>
            <OrganizerManagement items={items} />
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
