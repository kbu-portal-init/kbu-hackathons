import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listPublishedAnnouncements } from "@/actions/management/announcements";
import { BackButton } from "@/components/back-button";
import { PaginationFooter } from "@/components/pagination-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { ListPublicAnnouncementSchema } from "@/lib/contracts/announcements";
import { isOwnedR2PublicUrl } from "@/lib/r2";

export const metadata: Metadata = {
    title: "Announcements | KBU Hackathon 2026",
    description: "Registration dates, community news, and important updates from the KBU Hackathon 2026 team.",
};

const PAGE_SIZE = 10;
const MAX_SEARCH_LENGTH = 100;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

function AnnouncementCard({ announcement }: { announcement: PublicAnnouncementDTO }) {
    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

    const imageUrl =
        announcement.imageUrl &&
        (isOwnedR2PublicUrl(announcement.imageUrl, "uploads/announcements") ||
            isOwnedR2PublicUrl(announcement.imageUrl, "uploads/events"))
            ? announcement.imageUrl
            : "/images/kbu.webp";

    return (
        <Link
            href={`/announcements/${announcement.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-200 hover:border-orange-300 transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <Image
                    src={imageUrl}
                    alt={announcement.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <article className="flex flex-1 flex-col p-5">
                <time
                    dateTime={new Date(publishedDate).toISOString()}
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"
                >
                    {dateFormatter.format(new Date(publishedDate))}
                </time>

                <h2 className="mt-3 line-clamp-2 text-lg font-bold tracking-tight text-foreground">
                    {announcement.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{announcement.content}</p>
            </article>
        </Link>
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

        if (search) {
            query.set("search", search);
        }

        if (page > 1) {
            query.set("page", String(page));
        }

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

        if (filters.page > lastPage) {
            redirect(getPageHref(lastPage));
        }
    }

    const items = result.ok ? result.data.items : [];
    const meta = result.ok ? result.data.meta : null;

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mb-8">
                <BackButton fallbackHref="/" />
            </div>

            <section className="mb-8 max-w-3xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                    Announcements
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                    Stay up to date with registration deadlines, event news, and important updates from KBU Hackathon
                    2026.
                </p>
            </section>

            <section className="mb-10">
                <search>
                    <form action="/announcements" method="get" className="flex max-w-3xl items-center gap-2">
                        <Input
                            key={search ?? ""}
                            type="search"
                            name="search"
                            defaultValue={search}
                            placeholder="Search announcements..."
                            aria-label="Search announcements"
                            maxLength={MAX_SEARCH_LENGTH}
                            className="h-11"
                        />

                        <Button type="submit" className="h-11 px-6">
                            Search
                        </Button>

                        {search && (
                            <Link
                                href="/announcements"
                                className="shrink-0 text-sm font-medium text-primary hover:underline"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </search>
            </section>

            {!result.ok && (
                <p className="py-16 text-center text-sm text-muted-foreground">
                    Failed to load announcements. Please try again later.
                </p>
            )}

            {result.ok && items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                    {search ? `No announcements match "${search}".` : "No announcements yet. Check back soon."}
                </p>
            )}

            {items.length > 0 && (
                <section
                    aria-label="Published announcements"
                    className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                >
                    {items.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))}
                </section>
            )}

            {meta && items.length > 0 && (
                <div className="mt-10">
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
        </main>
    );
}
