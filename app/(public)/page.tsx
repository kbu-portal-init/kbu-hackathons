import Link from "next/link";
import { Suspense } from "react";
import { AboutContent } from "@/app/(public)/_components/about-content";
import { HomeAnnouncements, HomeAnnouncementsSkeleton } from "@/app/(public)/_components/home-announcements";
import { HomeFinalCta, HomeHero } from "@/app/(public)/_components/home-event";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function Home() {
    const locale = await getLocale();
    const t = getMessages(locale);

    return (
        <main className="bg-background">
            {/* Hero section */}
            <HomeHero locale={locale} />

            {/* About section & Need help section & FAQ section */}
            <section className="border-b-2 border-border bg-secondary">
                <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
                    <AboutContent />
                </div>
            </section>

            {/* Latest from the community section */}
            <section className="bg-background">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
                    <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                        <div>
                            <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                                {t.home.communityTitle}
                            </h2>
                            <p className="mt-4 max-w-sm text-base leading-7 text-muted-foreground">
                                {t.home.announcementsIntro}
                            </p>
                            <Link
                                href="/announcements"
                                className="mt-6 inline-flex min-h-11 items-center font-display text-sm font-semibold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                {t.home.readAnnouncements}
                            </Link>
                        </div>
                        <Suspense fallback={<HomeAnnouncementsSkeleton locale={locale} />}>
                            <HomeAnnouncements locale={locale} />
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* Final call to action section */}
            <HomeFinalCta locale={locale} />
        </main>
    );
}
