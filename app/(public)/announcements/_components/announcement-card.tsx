import { CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnnouncementCategoryBadge } from "@/components/announcements/announcement-badge";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import type { Locale } from "@/lib/i18n/config";
import { isOwnedR2PublicUrl } from "@/lib/r2";

function getCategory(category: PublicAnnouncementDTO["category"]) {
    switch (category) {
        case "IMPORTANT":
            return "important";
        case "UPDATES":
            return "update";
        case "NEWS":
            return "news";
    }
}

type AnnouncementCardProps = {
    announcement: PublicAnnouncementDTO;
    locale: Locale;
};

export default function AnnouncementCard({ announcement, locale }: AnnouncementCardProps) {
    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

    const imageUrl =
        announcement.imageUrl &&
        (isOwnedR2PublicUrl(announcement.imageUrl, "uploads/announcements") ||
            isOwnedR2PublicUrl(announcement.imageUrl, "uploads/events"))
            ? announcement.imageUrl
            : "/images/kbu.webp";

    const formattedDate = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
        dateStyle: "medium",
        timeZone: "Asia/Bangkok",
    }).format(new Date(publishedDate));

    return (
        <Link
            href={`/announcements/${announcement.id}`}
            className="group grid min-w-0 gap-4 border-b-2 border-border/15 py-6 transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:grid-cols-[7.5rem_1fr] lg:grid-cols-[8.5rem_7rem_1fr_auto] lg:items-start lg:gap-6 lg:px-2"
        >
            <time
                dateTime={new Date(publishedDate).toISOString()}
                className="inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:pt-1"
            >
                <CalendarDays aria-hidden="true" className="size-3.5 shrink-0 lg:hidden" />
                {formattedDate}
            </time>

            <div className="relative aspect-4/3 w-full max-w-32 overflow-hidden border-2 border-border bg-secondary max-lg:hidden lg:block">
                <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="112px"
                />
            </div>

            <article className="min-w-0 sm:col-span-1 lg:col-span-1">
                <h2 className="font-display text-xl font-semibold leading-7 text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                    {announcement.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    {announcement.content}
                </p>
            </article>

            <div className="sm:col-start-2 lg:col-start-auto lg:pt-1">
                <AnnouncementCategoryBadge category={getCategory(announcement.category)} />
            </div>
        </Link>
    );
}
