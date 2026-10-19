import { NotebookPen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { EventSettingsDTO } from "@/lib/contracts/event-settings";
import { getEventSettings } from "@/lib/data/event-settings";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { HomeAuthAction } from "./home-auth-action";

type RegistrationState = "open" | "not-started" | "closed" | "unavailable";

function registrationStateFrom(event: EventSettingsDTO | null): RegistrationState {
    if (event === null) return "unavailable";
    const now = Date.now();
    if (now < new Date(event.registrationOpensAt).getTime()) return "not-started";
    if (now > new Date(event.registrationClosesAt).getTime()) return "closed";
    return "open";
}

function formatDate(value: string, locale: Locale): string {
    return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
    }).format(new Date(value));
}

function formatRange(start: string, end: string, locale: Locale): string {
    return `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
}

function RegistrationButton({
    state,
    locale,
    tone = "light",
}: {
    state: RegistrationState;
    locale: Locale;
    tone?: "light" | "dark";
}) {
    const t = getMessages(locale).register;

    if (state === "open") {
        const className =
            tone === "dark"
                ? "inline-flex min-h-12 items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-3 font-display text-base font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                : "inline-flex min-h-12 items-center justify-center gap-2 border-2 border-border bg-foreground px-6 py-3 font-display text-base font-semibold text-background transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

        return (
            <Link href="/register" className={className}>
                <NotebookPen className="size-5" aria-hidden="true" />
                {t.title}
            </Link>
        );
    }

    return (
        <button
            type="button"
            disabled
            className={
                tone === "dark"
                    ? "inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 border-2 border-background/25 bg-background/10 px-6 py-3 font-display text-base font-semibold text-background/60"
                    : "inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 border-2 border-foreground/25 px-6 py-3 font-display text-base font-semibold text-foreground/60"
            }
        >
            <NotebookPen className="size-5" aria-hidden="true" />
            {state === "not-started" ? t.notOpened : state === "closed" ? t.closed : t.unavailable}
        </button>
    );
}

function EventFact({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b-2 border-foreground/20 px-1 py-4 last:border-b-0 sm:border-b-0 sm:border-r-2 sm:px-5 sm:last:border-r-0">
            <p className="font-display text-xs font-semibold text-foreground/75">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-foreground">{value}</p>
        </div>
    );
}

export async function HomeHero({ locale }: { locale: Locale }) {
    const t = getMessages(locale);
    const event = await getEventSettings();
    const registrationState = registrationStateFrom(event);

    return (
        <section className="relative text-foreground">
            <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12 lg:pt-10">
                <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12">
                    <div>
                        <div className="flex items-center justify-between gap-4 border-b-2 border-foreground/25 pb-3">
                            <p className="font-display text-xs font-semibold sm:text-sm">Kasem Bundit University</p>
                            <p className="font-display text-xs font-semibold sm:text-sm">{t.home.eventEyebrow}</p>
                        </div>

                        <h1 className="mt-7 font-display text-[clamp(3.25rem,13vw,7rem)] font-bold leading-[0.84] tracking-tighter">
                            {event?.title ?? "KBU Hackathon 2026"}
                        </h1>

                        <p className="mt-6 max-w-lg text-lg leading-7 font-medium sm:text-xl sm:leading-8">
                            {t.home.heroIntro}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <RegistrationButton state={registrationState} locale={locale} />
                            <HomeAuthAction locale={locale} />
                        </div>

                        {registrationState === "open" && event && (
                            <p className="mt-4 font-display text-sm font-semibold text-primary">
                                {t.home.registrationCloses} {formatDate(event.registrationClosesAt, locale)}
                            </p>
                        )}
                    </div>

                    <figure className="relative mx-auto w-full max-w-sm lg:mt-4 lg:max-w-none">
                        <div
                            className="absolute inset-0 translate-x-2 translate-y-2 border-2 border-border bg-foreground"
                            aria-hidden="true"
                        />
                        <div className="relative border-2 border-border bg-background p-2.5">
                            <div className="relative aspect-16/10 overflow-hidden bg-secondary">
                                <Image
                                    src="/images/kbu.webp"
                                    alt={event?.title ?? "KBU Hackathon 2026 event poster"}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 42vw"
                                    priority
                                />
                            </div>
                            <figcaption className="mt-2.5 flex items-center justify-between gap-3 font-display text-xs font-semibold">
                                <span>{t.home.slogan}</span>
                                <span className="text-foreground/60">KBU / 2026</span>
                            </figcaption>
                        </div>
                    </figure>
                </div>

                {event && (
                    <div className="mt-10 border-y-2 border-foreground/25 sm:grid sm:grid-cols-3">
                        <EventFact
                            label={t.home.eventDates}
                            value={formatRange(event.startsAt, event.endsAt, locale)}
                        />
                        <EventFact
                            label={t.home.registrationDates}
                            value={formatRange(event.registrationOpensAt, event.registrationClosesAt, locale)}
                        />
                        <EventFact label={t.home.venue} value={event.venue ?? t.home.datesTba} />
                    </div>
                )}
            </div>
        </section>
    );
}

export async function HomeFinalCta({ locale }: { locale: Locale }) {
    const t = getMessages(locale);
    const event = await getEventSettings();
    const registrationState = registrationStateFrom(event);

    return (
        <section className="bg-foreground text-background">
            <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <h2 className="max-w-2xl font-display text-[clamp(2.75rem,9vw,6rem)] font-bold leading-[0.88] tracking-tight">
                        {t.home.calloutTitle}
                    </h2>
                    <div>
                        <p className="max-w-md text-base leading-7 text-background/80 sm:text-lg">
                            {t.home.finalTitle}
                        </p>
                        {event && (
                            <p className="mt-4 font-display text-sm font-semibold text-accent">
                                {t.home.registrationCloses} {formatDate(event.registrationClosesAt, locale)}
                            </p>
                        )}
                        <div className="mt-6">
                            <RegistrationButton state={registrationState} locale={locale} tone="dark" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
