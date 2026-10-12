import { ChevronRight, House, Megaphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AnnouncementSearch } from "@/components/announcements/announcement-search";
import AnnouncementSidebar from "@/components/announcements/announcement-sidebar";
import { ListPublicAnnouncementSchema } from "@/lib/contracts/announcements";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

import { AnnouncementResults } from "./_components/announcement-results";
import AnnouncementResultsFallback from "./_components/announcement-results-fallback";

export const metadata: Metadata = {
    title: "Announcements | KBU Hackathon 2026",
    description: "Registration dates, community news, and important updates from the KBU Hackathon 2026 team.",
};

const MAX_SEARCH_LENGTH = 100;

type Category = "all" | "important" | "update" | "news";

const categories: { value: Category }[] = [
    { value: "all" },
    { value: "important" },
    { value: "update" },
    { value: "news" },
];

function getCategoryHref(category: Category, search?: string): string {
    const query = new URLSearchParams();

    if (category !== "all") {
        query.set("category", category);
    }

    if (search) {
        query.set("search", search);
    }

    const queryString = query.toString();

    return queryString ? `/announcements?${queryString}` : "/announcements";
}

export default async function AnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        search?: string;
        category?: string;
    }>;
}) {
    const params = await searchParams;
    const t = getMessages(await getLocale()).announcementsPage;

    const parsed = ListPublicAnnouncementSchema.safeParse({
        page: params.page,
        search: params.search,
    });

    const filters = parsed.success ? parsed.data : ListPublicAnnouncementSchema.parse({});

    const search = filters.search ? filters.search.slice(0, MAX_SEARCH_LENGTH) : undefined;

    const category: Category =
        params.category === "important" || params.category === "update" || params.category === "news"
            ? params.category
            : "all";

    return (
        <main className="relative mx-auto w-full max-w-7xl flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-orange-100/50 blur-3xl"
            />

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="relative mb-4 flex items-center gap-2 text-sm sm:mb-5">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                >
                    <House aria-hidden="true" className="size-4" />
                    {t.home}
                </Link>

                <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground/60" />

                <span aria-current="page" className="font-semibold text-foreground">
                    {t.title}
                </span>
            </nav>

            {/* Page heading */}
            <section className="relative mb-5 sm:mb-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-primary sm:size-14">
                        <Megaphone aria-hidden="true" className="size-6 sm:size-7" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm">
                            KBU Hackathon 2026
                        </p>

                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                            {t.title}
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                            {t.intro}
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and category filters */}
            <section className="relative mb-5 sm:mb-6">
                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
                    {/* Search bar */}
                    <div className="min-w-0 flex-1">
                        <AnnouncementSearch
                            defaultValue={search}
                            category={category}
                            labels={{
                                search: t.search,
                                searchButton: t.searchButton,
                                openSearch: t.openSearch,
                                closeSearch: t.closeSearch,
                            }}
                        />
                    </div>

                    {/* Category buttons */}
                    <nav aria-label={t.filterLabel} className="flex shrink-0 flex-wrap items-center gap-2">
                        {categories.map((item) => {
                            const isActive = category === item.value;

                            return (
                                <Link
                                    key={item.value}
                                    href={getCategoryHref(item.value, search)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "border-orange-600 bg-orange-600 text-white"
                                            : "border-border bg-white text-muted-foreground hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                    }`}
                                >
                                    {t.categories[item.value]}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </section>

            {/* Announcement list and sidebar */}
            <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
                <section aria-label={t.title} className="min-w-0">
                    <Suspense fallback={<AnnouncementResultsFallback />}>
                        <AnnouncementResults
                            page={filters.page}
                            search={search}
                            category={category}
                            labels={{
                                loadError: t.loadError,
                                emptyFor: t.emptyFor,
                                emptyAll: t.emptyAll,
                                emptyUpdates: t.emptyUpdates,
                                emptyImportant: t.emptyImportant,
                                emptyNews: t.emptyNews,
                                readAnnouncement: t.readAnnouncement,
                            }}
                        />
                    </Suspense>
                </section>

                <aside className="min-w-0 self-start">
                    <AnnouncementSidebar />
                </aside>
            </div>
        </main>
    );
}
