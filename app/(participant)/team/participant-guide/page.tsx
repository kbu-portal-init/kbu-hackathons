import { ArrowUpRight, Award, GraduationCap, HelpCircle, Megaphone, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { PosterPanel } from "@/components/poster-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getLineContact } from "@/lib/public-data/line-contact";
import { EventGuide, EventGuideSkeleton } from "./_components/event-guide";
import { ReferenceSections } from "./_components/reference-sections";

export default async function TeamParticipantGuidePage() {
    const locale = await getLocale();
    const t = getMessages(locale).references;
    const lineContact = getLineContact();

    return (
        <main className="space-y-8">
            <DashboardPageHeader
                title={t.title}
                description={t.intro}
                actions={
                    <Badge variant="accent">
                        <Sparkles aria-hidden="true" />
                        {t.badge}
                    </Badge>
                }
            />

            <div className="space-y-10">
                <Suspense fallback={<EventGuideSkeleton label={t.loading} />}>
                    <EventGuide locale={locale} t={t} />
                </Suspense>

                <ReferenceSections t={t} />

                <section aria-labelledby="prizes-title">
                    <PosterPanel className="bg-secondary p-6">
                        <div className="flex items-center gap-3">
                            <Award aria-hidden="true" className="size-5 text-primary" />
                            <h2
                                className="font-display text-2xl font-bold tracking-tight text-foreground"
                                id="prizes-title"
                            >
                                {t.prizes.title}
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{t.prizes.description}</p>
                        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="border-t-2 border-border/15 pt-3">
                                <dt className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    {t.prizes.cashLabel}
                                </dt>
                                <dd className="mt-1 font-display text-2xl font-bold text-foreground">
                                    {t.prizes.cashValue}
                                </dd>
                            </div>
                            <div className="border-t-2 border-border/15 pt-3">
                                <dt className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    {t.prizes.internshipLabel}
                                </dt>
                                <dd className="mt-1 text-sm leading-6 text-foreground">{t.prizes.internshipValue}</dd>
                            </div>
                        </dl>
                        <ul className="mt-5 space-y-2 border-t-2 border-border/15 pt-4">
                            {t.prizes.tiers.map((tier) => (
                                <li key={tier.title} className="text-sm leading-6 text-foreground">
                                    <span className="font-semibold">{tier.title}:</span> {tier.reward}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.prizes.allParticipants}</p>
                    </PosterPanel>
                </section>

                <section aria-labelledby="resources-title" className="scroll-mt-24" id="resources">
                    <header className="max-w-2xl">
                        <h2
                            className="font-display text-2xl font-bold tracking-tight text-foreground"
                            id="resources-title"
                        >
                            {t.resources.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t.resources.description}</p>
                    </header>

                    <PosterPanel className="mt-5 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-display text-lg font-bold text-foreground">{t.resources.primary}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.resources.primaryHint}</p>
                        </div>
                        <Link className={buttonVariants({ variant: "brand" })} href="/team/submit">
                            {t.guide.submission.cta}
                            <Rocket aria-hidden="true" className="size-4" />
                        </Link>
                    </PosterPanel>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Link
                            className="group border-2 border-border bg-card p-5 transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            href="/resources"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <GraduationCap aria-hidden="true" className="size-5 text-primary" />
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </div>
                            <h3 className="mt-4 font-display text-base font-bold text-foreground">
                                {t.resources.studentResources}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {t.resources.studentResourcesHint}
                            </p>
                        </Link>
                        <Link
                            className="group border-2 border-border bg-card p-5 transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            href="/announcements"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <Megaphone aria-hidden="true" className="size-5 text-primary" />
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </div>
                            <h3 className="mt-4 font-display text-base font-bold text-foreground">
                                {t.resources.announcements}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {t.resources.announcementsHint}
                            </p>
                        </Link>
                    </div>
                </section>

                <section className="flex flex-col gap-4 border-2 border-border/15 bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <HelpCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div>
                            <h2 className="font-display text-lg font-bold text-foreground">{t.help.title}</h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.help.text}</p>
                        </div>
                    </div>
                    {lineContact.url ? (
                        <Link
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                            href={lineContact.url}
                            rel="noreferrer"
                            target="_blank"
                        >
                            {lineContact.name || t.help.lineFallback}
                            <ArrowUpRight aria-hidden="true" className="size-3.5" />
                        </Link>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
