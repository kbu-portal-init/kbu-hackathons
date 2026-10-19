import { ArrowRight, Megaphone, Star } from "lucide-react";
import Link from "next/link";

import { listPublishedAnnouncements } from "@/actions/management/announcements";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

type SidebarAnnouncement = Pick<PublicAnnouncementDTO, "id" | "title">;

type SidebarLabels = {
    important: string;
    latestNews: string;
    empty: string;
    viewAll: string;
};

async function getHighlights(category: "IMPORTANT" | "NEWS"): Promise<SidebarAnnouncement[]> {
    const result = await listPublishedAnnouncements({
        page: 1,
        pageSize: 3,
        category,
    });

    return result.ok ? result.data.items : [];
}

function HighlightPanel({
    title,
    category,
    announcements,
    labels,
}: {
    title: string;
    category: "important" | "news";
    announcements: SidebarAnnouncement[];
    labels: SidebarLabels;
}) {
    const isImportant = category === "important";
    const Icon = isImportant ? Star : Megaphone;

    return (
        <section className="border-2 border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
                <Icon
                    aria-hidden="true"
                    className={`size-4 shrink-0 ${isImportant ? "text-primary" : "text-success"}`}
                />
                <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
            </div>

            {announcements.length > 0 ? (
                <ul className="divide-y divide-border/15">
                    {announcements.map((announcement) => (
                        <li key={announcement.id} className="py-2 first:pt-1 last:pb-1">
                            <Link
                                href={`/announcements/${announcement.id}`}
                                className="group flex items-start justify-between gap-2 text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <span className="line-clamp-2 min-w-0">{announcement.title}</span>
                                <ArrowRight
                                    aria-hidden="true"
                                    className="mt-0.5 size-3.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="py-2 text-xs leading-5 text-muted-foreground">{labels.empty}</p>
            )}

            <Link
                href={`/announcements?category=${category}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
                {labels.viewAll}
            </Link>
        </section>
    );
}

export default async function AnnouncementSidebar() {
    const locale = await getLocale();
    const messages = getMessages(locale);
    const labels = messages.announcementsPage.sidebar;

    const [important, news] = await Promise.all([getHighlights("IMPORTANT"), getHighlights("NEWS")]);

    return (
        <aside className="flex w-full flex-col gap-3">
            <HighlightPanel title={labels.important} category="important" announcements={important} labels={labels} />
            <HighlightPanel title={labels.latestNews} category="news" announcements={news} labels={labels} />
        </aside>
    );
}
