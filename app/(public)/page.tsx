import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AboutContent } from "@/app/(public)/_components/about-content";
import { HomeAnnouncements, HomeAnnouncementsSkeleton } from "@/app/(public)/_components/home-announcements";
import { HomeFinalCta, HomeHero } from "@/app/(public)/_components/home-event";
import ScrollFx from "@/components/scroll-fx";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function Home() {
    const locale = await getLocale();
    const t = getMessages(locale);

    return (
        <main className="overflow-hidden">
            <ScrollFx />

            <HomeHero locale={locale} />

            <section className="bg-secondary/60">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <AboutContent />
                </div>
            </section>

            {/* Announcements */}
            <section className="relative bg-background border-t border-border/80 dot-grid">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                        <div data-reveal>
                            <p className="font-mono text-sm font-medium text-primary">{t.home.latestAnnouncements}</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {t.home.communityTitle}
                            </h2>
                            <p className="mt-4 text-brand-muted-foreground">{t.home.announcementsIntro}</p>
                            <Link
                                href="/announcements"
                                className="mt-6 inline-flex items-center gap-1 font-semibold text-primary transition hover:text-primary/90"
                            >
                                {locale === "th" ? "อ่านประกาศทั้งหมด" : "Read all announcements"}{" "}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <Suspense fallback={<HomeAnnouncementsSkeleton locale={locale} />}>
                            <HomeAnnouncements locale={locale} />
                        </Suspense>
                    </div>
                </div>
            </section>

            <HomeFinalCta locale={locale} />
        </main>
    );
}
