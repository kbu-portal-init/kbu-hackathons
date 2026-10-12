import { redirect } from "next/navigation";

import { listPublishedAnnouncements } from "@/actions/management/announcements";
import { PaginationFooter } from "@/components/pagination-footer";
import { getLocale } from "@/lib/i18n/server";

import AnnouncementCard from "./announcement-card";

const PAGE_SIZE = 10;

type Category = "all" | "important" | "update" | "news";

type AnnouncementResultsProps = {
    page: number;
    search?: string;
    category: Category;
    labels: {
        loadError: string;
        emptyFor: string;
        emptyAll: string;
        emptyUpdates: string;
        emptyImportant: string;
        emptyNews: string;
        readAnnouncement: string;
    };
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

export async function AnnouncementResults({ page, search, category, labels }: AnnouncementResultsProps) {
    const locale = await getLocale();

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

    let emptyMessage = "";

    if (search) {
        emptyMessage = `${labels.emptyFor} "${search}".`;
    } else {
        switch (category) {
            case "all":
                emptyMessage = labels.emptyAll;
                break;
            case "update":
                emptyMessage = labels.emptyUpdates;
                break;
            case "important":
                emptyMessage = labels.emptyImportant;
                break;
            case "news":
                emptyMessage = labels.emptyNews;
                break;
        }
    }

    return (
        <>
            {!result.ok && (
                <p role="alert" className="py-10 text-center text-sm text-muted-foreground">
                    {labels.loadError}
                </p>
            )}

            {result.ok && items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border bg-white/70 py-10 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                </p>
            )}

            {items.length > 0 && (
                <div className="flex min-w-0 flex-col gap-3">
                    {items.map((announcement) => (
                        <AnnouncementCard
                            key={announcement.id}
                            announcement={announcement}
                            locale={locale}
                            readAnnouncement={labels.readAnnouncement}
                        />
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
