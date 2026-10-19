import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PosterBreadcrumb } from "@/components/poster-breadcrumb";
import { ShareButton } from "@/components/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedAnnouncementById } from "@/lib/data/announcements";
import { resolveOgImageUrl } from "@/lib/data/og-image";

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
            title: "Announcement not found | KBU Hackathon 2026",
        };
    }

    const description = getDescription(announcement.content);
    const ogImageUrl = await resolveOgImageUrl(announcement.imageUrl);

    return {
        title: `${announcement.title} | KBU Hackathon 2026`,
        description,
        openGraph: {
            type: "website",
            siteName: "KBU Hackathon 2026",
            title: announcement.title,
            description,
            images: [{ url: ogImageUrl }],
        },
        twitter: {
            card: "summary_large_image",
            title: announcement.title,
            description,
            images: [ogImageUrl],
        },
    };
}

function AnnouncementContentFallback() {
    return (
        <article className="mt-8" role="status" aria-label="Loading announcement">
            <span className="sr-only">Loading announcement</span>
            <div className="border-2 border-brand-ink bg-brand-paper p-2">
                <Skeleton className="aspect-2/1 w-full rounded-none bg-brand-ink/10" />
            </div>
            <Skeleton className="mt-6 h-4 w-48 rounded-none bg-primary/20" />
            <Skeleton className="mt-6 h-10 w-3/4 max-w-full rounded-none bg-brand-ink/10" />
            <div className="mt-8 space-y-4">
                {(["one", "two", "three", "four", "five"] as const).map((row) => (
                    <Skeleton className="h-5 w-full rounded-none bg-brand-ink/10" key={row} />
                ))}
            </div>
        </article>
    );
}

function AnnouncementContentSkeleton({ title }: { title: string }) {
    return (
        <>
            <PosterBreadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Announcements", href: "/announcements" },
                    { label: title },
                ]}
                className="mb-8"
            />
            <AnnouncementContentFallback />
        </>
    );
}

async function AnnouncementContent({ announcementId }: { announcementId: string }) {
    const announcement = await getPublishedAnnouncementById(announcementId);

    if (!announcement) {
        notFound();
    }

    const publishedDate = announcement.publishedAt ?? announcement.createdAt;
    const imageUrl = announcement.imageUrl ?? "/images/kbu.webp";

    return (
        <>
            <PosterBreadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Announcements", href: "/announcements" },
                    { label: announcement.title },
                ]}
                className="mb-8"
            />

            <article>
                <figure className="relative">
                    <div
                        className="absolute inset-0 translate-x-2 translate-y-2 border-2 border-brand-ink bg-brand-ink"
                        aria-hidden="true"
                    />
                    <div className="relative border-2 border-brand-ink bg-brand-paper p-2">
                        <div className="relative aspect-2/1 overflow-hidden bg-secondary">
                            <Image
                                src={imageUrl}
                                alt={announcement.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 896px"
                                priority
                            />
                        </div>
                    </div>
                </figure>

                <div className="mt-7">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-y-2 border-brand-ink py-4">
                        <time
                            dateTime={new Date(publishedDate).toISOString()}
                            className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground sm:text-sm"
                        >
                            Published {dateFormatter.format(new Date(publishedDate))}
                        </time>
                        <ShareButton title={announcement.title} />
                    </div>

                    <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.92] tracking-[-0.04em] text-brand-ink">
                        {announcement.title}
                    </h1>

                    <div className="mt-5 whitespace-pre-wrap wrap-break-word text-base leading-8 text-brand-muted-foreground sm:text-lg">
                        {announcement.content}
                    </div>
                </div>
            </article>
        </>
    );
}

export default function AnnouncementPage({ params }: AnnouncementPageProps) {
    return (
        <main className="flex-1 bg-brand-paper">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
                <div className="mx-auto max-w-4xl">
                    <Suspense fallback={<AnnouncementContentSkeleton title="Announcement" />}>
                        {params.then(({ announcementId }) => (
                            <AnnouncementContent announcementId={announcementId} />
                        ))}
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
