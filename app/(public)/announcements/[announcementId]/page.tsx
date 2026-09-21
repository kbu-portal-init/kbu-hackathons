import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedAnnouncementById } from "@/lib/data/announcements";
import { ShareAnnouncementButton } from "./_components/share-announcement-button";

type AnnouncementPageProps = {
    params: Promise<{
        announcementId: string;
    }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "Asia/Bangkok",
});

function getDescription(content: string) {
    return content.replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({ params }: AnnouncementPageProps): Promise<Metadata> {
    const { announcementId } = await params;

    const announcement = await getPublishedAnnouncementById(announcementId);

    if (!announcement) {
        return {
            title: "Announcement not found | KBU Hub",
        };
    }

    const description = getDescription(announcement.content);

    return {
        title: `${announcement.title} | KBU Hub`,
        description,
        openGraph: {
            title: announcement.title,
            description,
            ...(announcement.imageUrl
                ? {
                      images: [announcement.imageUrl],
                  }
                : {}),
        },
    };
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
    const { announcementId } = await params;

    const announcement = await getPublishedAnnouncementById(announcementId);

    if (!announcement) {
        notFound();
    }

    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

    return (
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href="/announcements"
                    className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                    ← All announcements
                </Link>

                <ShareAnnouncementButton title={announcement.title} />
            </div>

            <article className="mt-8 overflow-hidden rounded-2xl border bg-card">
                {announcement.imageUrl && (
                    <div className="relative aspect-video w-full bg-muted">
                        <Image
                            src={announcement.imageUrl}
                            alt={announcement.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 896px) 100vw, 896px"
                            priority
                        />
                    </div>
                )}

                <div className="p-6 sm:p-10">
                    <time
                        dateTime={new Date(publishedDate).toISOString()}
                        className="text-sm font-medium text-muted-foreground"
                    >
                        {dateFormatter.format(new Date(publishedDate))}
                    </time>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {announcement.title}
                    </h1>

                    <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground">
                        {announcement.content}
                    </div>
                </div>
            </article>
        </main>
    );
}
