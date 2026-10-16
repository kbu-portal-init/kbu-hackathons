import { ChevronRight, House } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

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
        <main className="relative mx-auto w-full max-w-5xl flex-1 overflow-hidden px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-orange-100/40 blur-3xl"
            />

            <nav aria-label="Breadcrumb" className="relative mb-5 flex items-center gap-2 text-sm">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                >
                    <House aria-hidden="true" className="size-4" />
                    {t.home}
                </Link>

                <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground/60" />

                <span aria-current="page" className="font-medium text-foreground">
                    {t.title}
                </span>
            </nav>

            <section className="mb-8 max-w-3xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                    {t.title}
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{t.subtitle}</p>
            </section>

            <Suspense fallback={<AnnouncementResultsFallback />}>
                {searchParams.then((query) => (
                    <AnnouncementsContent query={query} locale={locale} />
                ))}
            </Suspense>
        </main>
    );
}
