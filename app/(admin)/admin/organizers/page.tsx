import Link from "next/link";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/guards";
import { listOrganizers } from "@/lib/data/organizers";
import { OrganizerManagement } from "./_components/organizer-management";

export default async function AdminOrganizersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
    await requireAdmin();
    const params = await searchParams;
    const data = await listOrganizers({ page: Number(params.page ?? 1), pageSize: Number(params.pageSize ?? 20) });
    const { items, meta } = data;
    const pageHref = (page: number) => `/admin/organizers?page=${page}&pageSize=${meta.pageSize}`;

    return (
        <main className="flex-1 space-y-8 p-6 lg:p-8">
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
            <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>
                    Showing {items.length} of {meta.total}
                </span>
                <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                        {meta.page > 1 && (
                            <PaginationItem>
                                <PaginationPrevious href={pageHref(meta.page - 1)} />
                            </PaginationItem>
                        )}
                        {meta.hasNextPage && (
                            <PaginationItem>
                                <PaginationNext href={pageHref(meta.page + 1)} />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>
        </main>
    );
}
