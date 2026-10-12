import { redirect } from "next/navigation";

import { listPublishedAnnouncements } from "@/actions/management/announcements";
import { PaginationFooter } from "@/components/pagination-footer";
import AnnouncementCard from "./announcement-card";

const PAGE_SIZE = 10;

type Category = "all" | "important" | "update" | "news";

type AnnouncementResultsProps = {
    page: number;
    search?: string;
    category: Category;
};

function getPageHref(target: number, search?: string, category: Category = "all"): string {
    const query = new URLSearchParams();

    if (category !== "all") {
        query.set("category", category);
    }

    if (search) {
        query.set("search", search);
    }

    if (target > 1) {
        query.set("page", String(target));
    }

    const queryString = query.toString();

    return queryString ? `/announcements?${queryString}` : "/announcements";
}

export async function AnnouncementResults({ page, search, category }: AnnouncementResultsProps) {
    const result = await listPublishedAnnouncements({
        page,
        pageSize: PAGE_SIZE,
        search,
        ...(category !== "all"
            ? {
                  category: category === "important" ? "IMPORTANT" : category === "update" ? "UPDATES" : "NEWS",
              }
            : {}),
    });

    if (result.ok) {
        const lastPage = Math.max(1, Math.ceil(result.data.meta.total / PAGE_SIZE));

        if (page > lastPage) {
            redirect(getPageHref(lastPage, search, category));
        }
    }

    const items = result.ok ? result.data.items : [];
    const meta = result.ok ? result.data.meta : null;

    return (
        <>
            {!result.ok && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Failed to load announcements. Please try again later.
                </p>
            )}

            {result.ok && items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border bg-white/70 py-10 text-center text-sm text-muted-foreground">
                    {search
                        ? `No announcements match "${search}".`
                        : category === "all"
                          ? "No announcements yet. Check back soon."
                          : category === "update"
                            ? "No updates found."
                            : category === "important"
                              ? "No important announcements found."
                              : "No news found."}
                </p>
            )}

            {items.length > 0 && (
                <div className="flex min-w-0 flex-col gap-3">
                    {items.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))}
                </div>
            )}

            {meta && items.length > 0 && (
                <div className="mt-6">
                    <PaginationFooter
                        page={meta.page}
                        pageSize={meta.pageSize}
                        total={meta.total}
                        itemsShown={items.length}
                        hasNextPage={meta.hasNextPage}
                        getPageHref={(target) => getPageHref(target, search, category)}
                    />
                </div>
            )}
        </>
    );
}
