import { Megaphone } from "lucide-react";
import Link from "next/link";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { listPublicAnnouncements } from "@/lib/data/announcements";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const announcementDateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

export async function HomeAnnouncements({ locale }: { locale: Locale }) {
    const t = getMessages(locale).home;
    try {
        const result = await listPublicAnnouncements({ page: 1, pageSize: 2 });

        if (result.items.length === 0) {
            return <p className="p-5 text-sm text-brand-muted-foreground">{t.noAnnouncements}</p>;
        }

        return (
            <div className="overflow-hidden rounded-2xl glass">
                {result.items.map((announcement: PublicAnnouncementDTO) => {
                    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

                    return (
                        <Link
                            key={announcement.id}
                            href={`/announcements/${announcement.id}`}
                            className="flex items-start gap-4 border-b border-primary/20 p-5 transition last:border-b-0 hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary focus-visible:ring-primary/30"
                        >
                            <Megaphone className="mt-0.5 size-5 shrink-0 text-primary" />
                            <div>
                                <time
                                    dateTime={new Date(publishedDate).toISOString()}
                                    className="font-mono text-xs font-medium text-primary"
                                >
                                    {announcementDateFormatter.format(new Date(publishedDate))}
                                </time>
                                <h3 className="mt-1.5 font-semibold text-foreground">{announcement.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-brand-muted-foreground">
                                    {announcement.content}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    } catch {
        return (
            <div className="rounded-2xl border border-secondary bg-secondary p-5 text-sm text-brand-muted-foreground">
                <p>{t.announcementsUnavailable}</p>
                <Link href="/announcements" className="mt-2 inline-flex font-semibold text-primary/90 underline">
                    View all announcements
                </Link>
            </div>
        );
    }
}

export function HomeAnnouncementsSkeleton({ locale }: { locale: Locale }) {
    return (
        <div className="overflow-hidden rounded-2xl glass" role="status" aria-label="Loading announcements">
            <span className="sr-only">{getMessages(locale).home.loadingAnnouncements}</span>
            {["one", "two"].map((item) => (
                <div className="animate-pulse border-b border-border/20 p-5 last:border-b-0" key={item}>
                    <div className="h-3 w-24 rounded bg-secondary" />
                    <div className="mt-3 h-5 w-3/4 rounded bg-zinc-100" />
                    <div className="mt-2 h-4 w-full rounded bg-zinc-100" />
                </div>
            ))}
        </div>
    );
}
