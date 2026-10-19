import Link from "next/link";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { listPublicAnnouncements } from "@/lib/data/announcements";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

function categoryLabel(category: PublicAnnouncementDTO["category"], locale: Locale): string {
    const labels = getMessages(locale).announcementsPage.categories;
    if (category === "IMPORTANT") return labels.important;
    if (category === "UPDATES") return labels.update;
    return labels.news;
}

function formatPublished(value: string, locale: Locale): string {
    return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
    }).format(new Date(value));
}

export async function HomeAnnouncements({ locale }: { locale: Locale }) {
    const t = getMessages(locale).home;

    try {
        const result = await listPublicAnnouncements({ page: 1, pageSize: 3 });

        if (result.items.length === 0) {
            return (
                <div className="border-2 border-brand-ink bg-brand-paper p-5 sm:p-6">
                    <p className="text-base text-brand-muted-foreground">{t.noAnnouncements}</p>
                    <Link
                        href="/announcements"
                        className="mt-3 inline-flex font-display text-sm font-semibold text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        {t.readAnnouncements}
                    </Link>
                </div>
            );
        }

        return (
            <div className="border-t-2 border-brand-ink">
                {result.items.map((announcement) => {
                    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

                    return (
                        <Link
                            key={announcement.id}
                            href={`/announcements/${announcement.id}`}
                            className="group grid gap-2 border-b-2 border-brand-ink/15 py-5 transition-colors hover:bg-brand-yellow/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:grid-cols-[8.5rem_1fr_auto] sm:gap-6 sm:px-2"
                        >
                            <time
                                dateTime={new Date(publishedDate).toISOString()}
                                className="font-display text-xs font-semibold text-primary sm:pt-1"
                            >
                                {formatPublished(publishedDate, locale)}
                            </time>
                            <div className="min-w-0">
                                <h3 className="font-display text-lg font-semibold leading-6 text-foreground group-hover:text-primary sm:text-xl">
                                    {announcement.title}
                                </h3>
                                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-brand-muted-foreground sm:text-base">
                                    {announcement.content}
                                </p>
                            </div>
                            <span className="font-display text-xs font-semibold text-brand-muted-foreground sm:pt-1">
                                {categoryLabel(announcement.category, locale)}
                            </span>
                        </Link>
                    );
                })}
            </div>
        );
    } catch {
        return (
            <div className="border-2 border-brand-ink bg-brand-paper p-5 sm:p-6">
                <p className="text-base text-brand-muted-foreground">{t.announcementsUnavailable}</p>
                <Link
                    href="/announcements"
                    className="mt-3 inline-flex font-display text-sm font-semibold text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    {t.readAnnouncements}
                </Link>
            </div>
        );
    }
}

export function HomeAnnouncementsSkeleton({ locale }: { locale: Locale }) {
    return (
        <div className="border-t-2 border-brand-ink" role="status" aria-label="Loading announcements">
            <span className="sr-only">{getMessages(locale).home.loadingAnnouncements}</span>
            {["one", "two", "three"].map((item) => (
                <div
                    key={item}
                    className="grid animate-pulse gap-2 border-b-2 border-brand-ink/15 py-5 motion-reduce:animate-none sm:grid-cols-[8.5rem_1fr_auto] sm:gap-6 sm:px-2"
                >
                    <div className="h-3 w-24 bg-brand-ink/10" />
                    <div>
                        <div className="h-5 w-3/4 bg-brand-ink/10" />
                        <div className="mt-2 h-4 w-full bg-brand-ink/10" />
                    </div>
                    <div className="h-3 w-16 bg-brand-ink/10" />
                </div>
            ))}
        </div>
    );
}
