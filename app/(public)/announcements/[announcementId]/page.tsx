import { ChevronRight, House } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
    const ogImageUrl = resolveOgImageUrl(announcement.imageUrl);
    const ogImage = { url: ogImageUrl, type: "image/jpeg", alt: announcement.title };

    return {
        title: `${announcement.title} | KBU Hackathon 2026`,
        description,
        openGraph: {
            type: "website",
            siteName: "KBU Hackathon 2026",
            title: announcement.title,
            description,
            images: [ogImage],
        },
        twitter: {
            card: "summary_large_image",
            title: announcement.title,
            description,
            images: [ogImage],
        },
    };
}

function AnnouncementContentFallback() {
    return (
        <article className="mt-10" role="status" aria-label="Loading announcement">
            <span className="sr-only">Loading announcement</span>
            <Skeleton className="aspect-2/1 w-full rounded-3xl bg-zinc-100" />
            <Skeleton className="mt-8 h-4 w-48 bg-orange-100" />
            <Skeleton className="mt-6 h-10 w-3/4 max-w-full bg-zinc-100" />
            <div className="mt-8 space-y-4">
                {(["one", "two", "three", "four", "five"] as const).map((row) => (
                    <Skeleton className="h-5 w-full bg-zinc-100" key={row} />
                ))}
            </div>
        </article>
    );
}

function AnnouncementBreadcrumb({ title }: { title: string }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 flex-wrap items-center gap-1 text-sm sm:mb-8">
            <Link
                href="/"
                className="inline-flex shrink-0 items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
                <House aria-hidden="true" className="size-4" />
                Home
            </Link>

            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />

            <Link href="/announcements" className="shrink-0 text-muted-foreground transition-colors hover:text-primary">
                Announcements
            </Link>

            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />

            <span
                aria-current="page"
                title={title}
                className="min-w-0 flex-1 basis-full break-words font-medium text-foreground sm:basis-auto"
            >
                {title}
            </span>
        </nav>
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
            <AnnouncementBreadcrumb title={announcement.title}></AnnouncementBreadcrumb>

            <article className="mt-4 sm:mt-6">
                {/* Announcement hero image */}
                <div className="relative aspect-2/1 w-full overflow-hidden rounded-3xl bg-muted shadow-sm">
                    <Image
                        src={imageUrl}
                        alt={announcement.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 896px"
                        priority
                    />
                </div>

                {/* Published date and share button */}
                <div className="mt-4 sm:mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border pb-4 sm:pb-5">
                        <time
                            dateTime={new Date(publishedDate).toISOString()}
                            className="text-xs font-bold uppercase tracking-[0.12em] text-primary sm:text-sm"
                        >
                            Published {dateFormatter.format(new Date(publishedDate))}
                        </time>

                        <div className="shrink-0">
                            <ShareButton title={announcement.title} />
                        </div>
                    </div>

                    {/* Announcement title */}
                    <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:mt-5 sm:text-5xl">
                        {announcement.title}
                    </h1>

                    {/* Announcement content */}
                    <div className="mt-3 whitespace-pre-wrap wrap-break-word text-base leading-7 text-brand-muted-foreground sm:mt-4 sm:text-lg sm:leading-8">
                        {announcement.content}
                    </div>
                </div>
            </article>
        </>
    );
}

export default function AnnouncementPage({ params }: AnnouncementPageProps) {
    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Suspense fallback={<AnnouncementContentFallback />}>
                    {params.then(({ announcementId }) => (
                        <AnnouncementContent announcementId={announcementId} />
                    ))}
                </Suspense>
            </div>
        </main>
    );
}
