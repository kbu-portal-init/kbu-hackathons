import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedAnnouncement } from "@/lib/data/announcements";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const announcement = await getPublishedAnnouncement(id);

    if (!announcement) {
        notFound();
    }

    return (
        <main className="flex-1 px-6 py-16 lg:py-20">
            <article className="mx-auto max-w-3xl space-y-8">
                <div>
                    <Link href="/announcements" className="text-sm font-medium text-cyan-600">
                        ← All announcements
                    </Link>
                    <div className="mt-6 flex items-center gap-3">
                        {announcement.pinned ? (
                            <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                                Pinned
                            </span>
                        ) : null}
                        <time className="text-sm text-zinc-500">
                            {new Date(announcement.publishedAt ?? announcement.createdAt).toLocaleDateString()}
                        </time>
                    </div>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{announcement.title}</h1>
                    {announcement.authorName ? (
                        <p className="mt-3 text-sm text-zinc-500">By {announcement.authorName}</p>
                    ) : null}
                </div>

                <div className="whitespace-pre-line text-lg leading-relaxed text-zinc-700 dark:text-zinc-200">
                    {announcement.body}
                </div>
            </article>
        </main>
    );
}
