import { ChevronRight, House, Megaphone } from "lucide-react";
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

export default async function AnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        search?: string;
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

            <section className="relative mb-7 sm:mb-9">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-primary sm:size-12">
                        <Megaphone aria-hidden="true" className="size-5 sm:size-6" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            KBU Hackathon 2026
                        </p>

                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                            {t.title}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                            Keep up with the latest news and updates from the hackathon team.
                        </p>
                    </div>
                </div>
            </section>

            <section aria-label={t.search} className="relative mb-6 sm:mb-8">
                <AnnouncementSearch
                    defaultValue={search}
                    category="all"
                    labels={{
                        search: t.search,
                        searchButton: t.searchButton,
                        openSearch: t.openSearch,
                        closeSearch: t.closeSearch,
                    }}
                />
            </section>

            <section aria-label={t.title} className="relative min-w-0">
                <Suspense fallback={<AnnouncementResultsFallback />}>
                    <AnnouncementResults
                        page={filters.page}
                        search={search}
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
