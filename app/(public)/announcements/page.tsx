import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listPublishedAnnouncements } from "@/actions/management/announcements";
import { PaginationFooter } from "@/components/pagination-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { ListPublicAnnouncementSchema } from "@/lib/contracts/announcements";

export const metadata: Metadata = {
    title: "Announcements | KBU Hub",
    description: "Registration dates, community news, and important updates from the KBU Hub team.",
};

const PAGE_SIZE = 10;
const MAX_SEARCH_LENGTH = 100;

// Format in the campus time zone so an early-morning post never shows the previous day.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

function AnnouncementCard({ announcement }: { announcement: PublicAnnouncementDTO }) {
    const date = announcement.publishedAt ?? announcement.createdAt;

    return (
        <article className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
            <time dateTime={date} className="text-xs font-semibold uppercase tracking-widest text-primary">
                {dateFormatter.format(new Date(date))}
            </time>
            <h2 className="mt-2 text-xl font-bold tracking-tight">{announcement.title}</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {announcement.content}
            </p>
        </article>
    );
}

export default async function AnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const params = await searchParams;

    const parsed = ListPublicAnnouncementSchema.safeParse(params);
    const filters = parsed.success ? parsed.data : ListPublicAnnouncementSchema.parse({});
    const search = filters.search ? filters.search.slice(0, MAX_SEARCH_LENGTH) : undefined;

    const getPageHref = (page: number) => {
        const query = new URLSearchParams();

        if (search) query.set("search", search);
        if (page > 1) query.set("page", String(page));

        const queryString = query.toString();

        return queryString ? `/announcements?${queryString}` : "/announcements";
    };

    const result = await listPublishedAnnouncements({
        page: filters.page,
        pageSize: PAGE_SIZE,
        search,
    });

    if (result.ok) {
        const lastPage = Math.max(1, Math.ceil(result.data.meta.total / PAGE_SIZE));

        if (filters.page > lastPage) redirect(getPageHref(lastPage));
    }

    const items = result.ok ? result.data.items : [];
    const meta = result.ok ? result.data.meta : null;

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Stay informed</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Announcements</h1>
                <p className="mt-3 text-muted-foreground">
                    Keep up with registration dates, community news, important updates, and everything happening at KBU
                    Hub.
                </p>

                <search className="mt-8">
                    <form action="/announcements" method="get" className="flex items-center gap-2">
                        <Input
                            key={search ?? ""}
                            type="search"
                            name="search"
                            defaultValue={search}
                            placeholder="Search announcements"
                            aria-label="Search announcements"
                            maxLength={MAX_SEARCH_LENGTH}
                        />

                        <Button type="submit">Search</Button>

                        {search && (
                            <Link href="/announcements" className="text-sm font-medium text-primary hover:underline">
                                Clear
                            </Link>
                        )}
                    </form>
                </search>

                <div className="mt-8 space-y-4">
                    {!result.ok && (
                        <p className="py-16 text-center text-sm text-muted-foreground">
                            Failed to load announcements. Please try again later.
                        </p>
                    )}

                    {result.ok && items.length === 0 && (
                        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                            {search ? `No announcements match "${search}".` : "No announcements yet. Check back soon."}
                        </p>
                    )}

                    {items.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))}
                </div>

                {meta && items.length > 0 && (
                    <div className="mt-8">
                        <PaginationFooter
                            page={meta.page}
                            pageSize={meta.pageSize}
                            total={meta.total}
                            itemsShown={items.length}
                            hasNextPage={meta.hasNextPage}
                            getPageHref={getPageHref}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
