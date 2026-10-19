import type { Metadata } from "next";
import { Suspense } from "react";
import { PosterBreadcrumb } from "@/components/poster-breadcrumb";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import AnnouncementResultsFallback from "./_components/announcement-results-fallback";
import { AnnouncementsContent } from "./_components/announcements-content";

export const metadata: Metadata = {
    title: "Announcements | KBU Hackathon 2026",
    description: "Registration dates, community news, and important updates from the KBU Hackathon 2026 team.",
};

export default async function AnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        search?: string;
        category?: string;
    }>;
}) {
    const locale = await getLocale();
    const t = getMessages(locale).announcementsPage;

    return (
        <main className="flex-1 bg-brand-paper">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
                <PosterBreadcrumb items={[{ label: t.home, href: "/" }, { label: t.title }]} className="mb-8" />

                <section className="mb-10 max-w-3xl border-b-2 border-brand-ink pb-8 sm:mb-12">
                    <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.88] tracking-[-0.045em] text-brand-ink">
                        {t.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-muted-foreground">{t.subtitle}</p>
                </section>

                <Suspense fallback={<AnnouncementResultsFallback />}>
                    {searchParams.then((query) => (
                        <AnnouncementsContent query={query} locale={locale} />
                    ))}
                </Suspense>
            </div>
        </main>
    );
}
