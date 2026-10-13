import { ChevronRight, House } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AnnouncementSearch } from "@/components/announcements/announcement-search";
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
        category: params.category,
    });

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
        <main className="relative mx-auto w-full max-w-5xl flex-1 overflow-hidden px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-orange-100/40 blur-3xl"
            />

            <nav aria-label="Breadcrumb" className="relative mb-5 flex items-center gap-2 text-sm">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                >
                    <House aria-hidden="true" className="size-4" />
                    {t.home}
                </Link>

                <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground/60" />

                <span aria-current="page" className="font-medium text-foreground">
                    {t.title}
                </span>
            </nav>

            <section className="mb-8 max-w-3xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                    {t.title}
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{t.subtitle}</p>
            </section>

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
        </main>
    );
}
