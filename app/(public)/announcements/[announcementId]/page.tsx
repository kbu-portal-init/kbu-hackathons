import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
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
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex items-center justify-between gap-4">
                <BackButton fallbackHref="/announcements" />
            </div>

            <article className="mx-auto mt-10 max-w-4xl">
                {announcement.imageUrl && (
                    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-3xl bg-muted shadow-sm">
                        <Image
                            src={announcement.imageUrl}
                            alt={announcement.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 896px"
                            priority
                        />
                    </div>
                )}

                <div className="mx-auto mt-10 max-w-3xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                        <time
                            dateTime={new Date(publishedDate).toISOString()}
                            className="text-xs font-bold uppercase tracking-[0.18em] text-primary"
                        >
                            Published {dateFormatter.format(new Date(publishedDate))}
                        </time>
                        <ShareAnnouncementButton title={announcement.title} />
                    </div>

                    <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                        {announcement.title}
                    </h1>

                    <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
                        {announcement.content}
                    </div>
                </div>
            </article>
        </main>
    );
}
