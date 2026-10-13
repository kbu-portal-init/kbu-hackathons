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
            className="group flex min-w-0 gap-4 rounded-xl border border-stone-200/80 bg-white p-4 transition-colors duration-200 hover:border-orange-300 hover:bg-orange-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-5 sm:p-5"
        >
            <div className="relative aspect-[4/3] w-28 shrink-0 self-start overflow-hidden rounded-lg bg-orange-50 sm:w-36">
                <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 112px, 144px"
                />
            </div>

            <article className="flex min-w-0 flex-1 flex-col">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <AnnouncementCategoryBadge
                        category={getCategory(announcement.category)}
                        className="px-2.5 py-1 text-xs"
                    />

                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                        <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
                        <time dateTime={publishedDate}>{formattedDate}</time>
                    </span>
                </div>

                <h2 className="line-clamp-2 text-lg font-semibold leading-7 tracking-tight text-foreground transition-colors group-hover:text-orange-700 sm:text-xl">
                    {announcement.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    {announcement.content}
                </p>
            </article>
        </Link>
    );
}
