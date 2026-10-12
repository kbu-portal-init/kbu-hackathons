import { CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnnouncementCategoryBadge } from "@/components/announcements/announcement-badge";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { isOwnedR2PublicUrl } from "@/lib/r2";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

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
};

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

    const imageUrl =
        announcement.imageUrl &&
        (isOwnedR2PublicUrl(announcement.imageUrl, "uploads/announcements") ||
            isOwnedR2PublicUrl(announcement.imageUrl, "uploads/events"))
            ? announcement.imageUrl
            : "/images/kbu.webp";

    const formattedDate = dateFormatter.format(new Date(publishedDate));

    return (
        <Link
            href={`/announcements/${announcement.id}`}
            className="group flex min-w-0 gap-3 rounded-lg border border-orange-950/10 bg-white p-2.5 transition-colors duration-200 hover:border-orange-300 hover:bg-orange-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-3.5 sm:p-3"
        >
            <div className="relative aspect-[4/3] w-20 shrink-0 self-start overflow-hidden rounded-md bg-orange-50 sm:w-24">
                <Image
                    src={imageUrl}
                    alt={announcement.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 80px, 96px"
                />
            </div>

            <article className="flex min-w-0 flex-1 flex-col">
                <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <AnnouncementCategoryBadge
                        category={getCategory(announcement.category)}
                        className="px-2 py-0.5 text-[10px]"
                    />

                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays aria-hidden="true" className="size-3 shrink-0 text-primary" />
                        <time dateTime={publishedDate}>{formattedDate}</time>
                    </span>
                </div>

                <h2 className="line-clamp-2 text-sm font-semibold leading-5 tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
                    {announcement.title}
                </h2>

                <p className="mt-1 line-clamp-2 text-xs leading-[1.4rem] text-muted-foreground">
                    {announcement.content}
                </p>

                <span className="mt-1.5 text-xs font-semibold text-primary">Read announcement</span>
            </article>
        </Link>
    );
}
