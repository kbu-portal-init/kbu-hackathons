import Link from "next/link";
import { Suspense } from "react";
import { AnnouncementSearch } from "@/components/announcements/announcement-search";
import { ListPublicAnnouncementSchema } from "@/lib/contracts/announcements";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { AnnouncementResults } from "./announcement-results";
import AnnouncementResultsFallback from "./announcement-results-fallback";

const MAX_SEARCH_LENGTH = 100;

type Category = "all" | "important" | "update" | "news";

const categories: { value: Category }[] = [
    { value: "all" },
    { value: "important" },
    { value: "update" },
    { value: "news" },
];

const categoryQueryValues: Record<Exclude<Category, "all">, "IMPORTANT" | "UPDATES" | "NEWS"> = {
    important: "IMPORTANT",
    update: "UPDATES",
    news: "NEWS",
};

function getCategoryHref(category: Category, search?: string): string {
    const query = new URLSearchParams();

    if (category !== "all") {
        query.set("category", categoryQueryValues[category]);
    }

    if (search) {
        query.set("search", search);
    }

    const queryString = query.toString();

    return queryString ? `/announcements?${queryString}` : "/announcements";
}

type AnnouncementQuery = {
    page?: string;
    search?: string;
    category?: string;
};

export function AnnouncementsContent({ query, locale }: { query: AnnouncementQuery; locale: Locale }) {
    const t = getMessages(locale).announcementsPage;

    const parsed = ListPublicAnnouncementSchema.safeParse(query);
    const filters = parsed.success ? parsed.data : ListPublicAnnouncementSchema.parse({});
    const search = filters.search ? filters.search.slice(0, MAX_SEARCH_LENGTH) : undefined;
    const activeCategory: Category = filters.category
        ? filters.category === "IMPORTANT"
            ? "important"
            : filters.category === "UPDATES"
              ? "update"
              : "news"
        : "all";

    return (
        <>
            <section aria-label={t.search} className="relative mb-6 sm:mb-8">
                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                        <AnnouncementSearch
                            defaultValue={search}
                            category={filters.category ?? "all"}
                            labels={{
                                search: t.search,
                                searchButton: t.searchButton,
                                closeSearch: t.closeSearch,
                            }}
                        />
                    </div>

                    <nav aria-label={t.filterLabel} className="flex shrink-0 flex-wrap items-center gap-2">
                        {categories.map((item) => {
                            const isActive = activeCategory === item.value;

                            return (
                                <Link
                                    key={item.value}
                                    href={getCategoryHref(item.value, search)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`inline-flex min-h-11 items-center justify-center border-2 px-4 py-2 font-display text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                        isActive
                                            ? "border-border bg-foreground text-background"
                                            : "border-border/20 bg-card text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                >
                                    {t.categories[item.value]}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </section>

            <section aria-label={t.title} className="relative min-w-0">
                <Suspense fallback={<AnnouncementResultsFallback />}>
                    <AnnouncementResults
                        page={filters.page}
                        search={search}
                        category={filters.category}
                        labels={{
                            loadError: t.loadError,
                            emptyAll: t.emptyAll,
                        }}
                    />
                </Suspense>
            </section>
        </>
    );
}
