import { CalendarDays, ClipboardPenLine, MapPin, NotebookPen, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { EventSettingsDTO } from "@/lib/contracts/event-settings";
import { getEventSettings } from "@/lib/data/event-settings";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { isOwnedR2PublicUrl } from "@/lib/r2";
import { HomeAuthAction } from "./home-auth-action";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
});

function formatDate(value: string) {
    return dateFormatter.format(new Date(value));
}

const glowBackground = "bg-[radial-gradient(ellipse_70%_60%_at_70%_-10%,rgba(109,40,217,0.12),transparent)]";

type RegistrationState = "open" | "not-started" | "closed" | "unavailable";

function registrationStateFrom(event: EventSettingsDTO | null): RegistrationState {
    if (event === null) return "unavailable";
    const now = Date.now();
    if (now < new Date(event.registrationOpensAt).getTime()) return "not-started";
    if (now > new Date(event.registrationClosesAt).getTime()) return "closed";
    return "open";
}

function RegistrationButton({ state, locale }: { state: RegistrationState; locale: Locale }) {
    const t = getMessages(locale).register;
    if (state === "open") {
        return (
            <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 focus-visible:outline-primary focus-visible:ring-primary/30"
            >
                <NotebookPen className="size-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none" />
                {t.title}
            </Link>
        );
    }

    return (
        <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-primary/45 px-5 py-3 font-semibold text-white/90 opacity-80"
        >
            <NotebookPen className="size-5" />
            {state === "not-started" ? t.notOpened : state === "closed" ? t.closed : t.unavailable}
        </button>
    );
}

export async function HomeHero({ locale }: { locale: Locale }) {
    const t = getMessages(locale);
    const event = await getEventSettings();
    const eventImage = event?.imageUrls.find((url) => isOwnedR2PublicUrl(url, "uploads/events"));
    const registrationState = registrationStateFrom(event);

    return (
        <section id="hero" className={`relative bg-background dot-grid ${glowBackground}`}>
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
                <div>
                    <p
                        data-reveal
                        className="inline-flex items-center gap-2 font-mono text-sm font-medium text-primary"
                    >
                        <Terminal className="size-4" />
                        <span>$ start</span>
                        <span className="inline-block h-4 w-2 animate-pulse text-primary" aria-hidden />
                    </p>
                    <h1
                        data-reveal
                        className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-foreground sm:text-7xl"
                    >
                        {event?.title ?? t.home.slogan}
                    </h1>
                    <p data-reveal className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {t.home.slogan}
                    </p>
                    <p data-reveal className="mt-6 max-w-xl text-lg leading-8 text-brand-muted-foreground">
                        {event?.description ??
                            "Step into the KBU hackathon workspace. Find your team, build something real, and get ready to compete."}
                    </p>
                    {event && (
                        <div
                            data-reveal
                            className="relative mt-8 max-w-2xl overflow-hidden rounded-2xl border border-primary/15 bg-white/70 shadow-lg shadow-primary/10 backdrop-blur-sm"
                        >
                            <div className="grid md:grid-cols-3">
                                <div className="border-b border-primary/15 p-5 md:border-b-0 md:border-r">
                                    <div className="flex items-center gap-2 text-primary">
                                        <CalendarDays className="size-4" />
                                        <p className="font-mono text-xs font-semibold tracking-wide">Hackathon</p>
                                    </div>
                                    <p className="mt-3 text-base font-bold leading-6 text-foreground">
                                        {formatDate(event.startsAt)}
                                        <span className="px-1 text-primary/70">–</span>
                                        {formatDate(event.endsAt)}
                                    </p>
                                </div>
                                <div className="border-b border-primary/15 p-5 md:border-b-0 md:border-r">
                                    <div className="flex items-center gap-2 text-primary">
                                        <ClipboardPenLine className="size-4" />
                                        <p className="font-mono text-xs font-semibold tracking-wide">Registration</p>
                                    </div>
                                    <p className="mt-3 text-base font-bold leading-6 text-foreground">
                                        {formatDate(event.registrationOpensAt)}
                                        <span className="px-1 text-primary/70">–</span>
                                        {formatDate(event.registrationClosesAt)}
                                    </p>
                                </div>
                                {event.venue && (
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 text-primary">
                                            <MapPin className="size-4" />
                                            <p className="font-mono text-xs font-semibold tracking-wide">Venue</p>
                                        </div>
                                        <p className="mt-3 text-base font-bold leading-6 text-foreground">
                                            {event.venue}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <RegistrationButton state={registrationState} locale={locale} />
                        <HomeAuthAction locale={locale} />
                    </div>
                </div>
                <div data-reveal className="relative">
                    <div className="absolute -inset-4 rounded-4xl bg-primary/10 blur-2xl" aria-hidden />
                    <div className="relative overflow-hidden rounded-2xl glass shadow-2xl shadow-primary/10">
                        <div className="flex items-center gap-2 border-b border-slate-200/70 px-4 py-3">
                            <span className="size-3 rounded-full bg-rose-300" aria-hidden />
                            <span className="size-3 rounded-full bg-amber-300" aria-hidden />
                            <span className="size-3 rounded-full bg-emerald-300" aria-hidden />
                            <span className="ml-3 font-mono text-xs text-brand-muted-foreground">
                                {event?.title ?? "event-preview"}
                            </span>
                        </div>
                        {eventImage ? (
                            <div className="relative aspect-1672/941 w-full bg-secondary">
                                <Image
                                    src={eventImage}
                                    alt={event?.title ?? "KBU Hackathon event"}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="relative aspect-1672/941 w-full bg-secondary">
                                <Image
                                    src="/images/kbu.webp"
                                    alt="KBU Hackathon event"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    priority
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Section divider — the gradient is reserved for CTAs, key
                headlines, and dividers only. */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-accent" aria-hidden />
        </section>
    );
}

export async function HomeFinalCta({ locale }: { locale: Locale }) {
    const t = getMessages(locale);
    const registrationState = registrationStateFrom(await getEventSettings());

    return (
        <section className="relative bg-background border-t border-border/80 dot-grid">
            <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                <p className="font-mono text-sm font-medium text-primary">$ ready_to_build --join</p>
                <h2
                    data-reveal
                    className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-tight text-foreground sm:text-5xl"
                >
                    {t.home.calloutTitle}
                </h2>
                <p data-reveal className="mx-auto mt-5 max-w-xl text-brand-muted-foreground">
                    {t.home.finalTitle}
                </p>
                <div data-reveal className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                    <RegistrationButton state={registrationState} locale={locale} />
                </div>
            </div>
        </section>
    );
}
