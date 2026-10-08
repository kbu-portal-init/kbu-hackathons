import { ArrowRight, CalendarDays, ClipboardPenLine, MapPin, Megaphone, NotebookPen, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AboutContent } from "@/app/(public)/_components/about-content";
import { HomeAuthRedirect } from "@/app/(public)/_components/home-auth-redirect";
import ScrollFx from "@/components/scroll-fx";
import type { PublicAnnouncementDTO } from "@/lib/contracts/announcements";
import { listPublicAnnouncements } from "@/lib/data/announcements";
import { getEventSettings } from "@/lib/data/event-settings";
import { isOwnedR2PublicUrl } from "@/lib/r2";

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

function RegistrationButton({ state }: { state: RegistrationState }) {
    if (state === "open") {
        return (
            <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600/90 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0"
            >
                <NotebookPen className="size-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none" />
                Register Your Team
            </Link>
        );
    }

    return (
        <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-orange-600/45 px-5 py-3 font-semibold text-white/90 opacity-80"
        >
            <NotebookPen className="size-5" />
            {state === "not-started"
                ? "Registration opens soon"
                : state === "closed"
                  ? "Registration closed"
                  : "Registration unavailable"}
        </button>
    );
}

const announcementDateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

async function HomeAnnouncements() {
    try {
        const result = await listPublicAnnouncements({ page: 1, pageSize: 2 });

        if (result.items.length === 0) {
            return <p className="p-5 text-sm text-brand-muted-foreground">No announcements have been published yet.</p>;
        }

        return (
            <div className="overflow-hidden rounded-2xl glass">
                {result.items.map((announcement: PublicAnnouncementDTO) => {
                    const publishedDate = announcement.publishedAt ?? announcement.createdAt;

                    return (
                        <Link
                            key={announcement.id}
                            href={`/announcements/${announcement.id}`}
                            className="flex items-start gap-4 border-b border-orange-200 p-5 transition last:border-b-0 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-600"
                        >
                            <Megaphone className="mt-0.5 size-5 shrink-0 text-orange-600" />
                            <div>
                                <time
                                    dateTime={new Date(publishedDate).toISOString()}
                                    className="font-mono text-xs font-medium text-orange-600"
                                >
                                    {announcementDateFormatter.format(new Date(publishedDate))}
                                </time>
                                <h3 className="mt-1.5 font-semibold text-foreground">{announcement.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-brand-muted-foreground">
                                    {announcement.content}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    } catch {
        return (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-brand-muted-foreground">
                <p>Announcements are temporarily unavailable.</p>
                <Link href="/announcements" className="mt-2 inline-flex font-semibold text-orange-700 underline">
                    View all announcements
                </Link>
            </div>
        );
    }
}

function HomeAnnouncementsFallback() {
    return (
        <div className="overflow-hidden rounded-2xl glass" role="status" aria-label="Loading announcements">
            <span className="sr-only">Loading announcements</span>
            {["one", "two"].map((item) => (
                <div className="animate-pulse border-b border-orange-200 p-5 last:border-b-0" key={item}>
                    <div className="h-3 w-24 rounded bg-orange-100" />
                    <div className="mt-3 h-5 w-3/4 rounded bg-zinc-100" />
                    <div className="mt-2 h-4 w-full rounded bg-zinc-100" />
                </div>
            ))}
        </div>
    );
}

export const dynamic = "force-dynamic";

export default async function Home() {
    const event = await getEventSettings();
    const eventImage = event?.imageUrls.find((url) => isOwnedR2PublicUrl(url, "uploads/events"));
    const now = Date.now();
    const registrationState: RegistrationState =
        event === null
            ? "unavailable"
            : now < new Date(event.registrationOpensAt).getTime()
              ? "not-started"
              : now > new Date(event.registrationClosesAt).getTime()
                ? "closed"
                : "open";

    return (
        <main className="overflow-hidden">
            <HomeAuthRedirect />
            <ScrollFx />
            {/* Hero — terminal-inspired light band with a static workspace card */}
            <section id="hero" className={`relative bg-background dot-grid ${glowBackground}`}>
                <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
                    <div>
                        <p
                            data-reveal
                            className="inline-flex items-center gap-2 font-mono text-sm font-medium text-orange-600"
                        >
                            <Terminal className="size-4" />
                            <span>$ start</span>
                            <span className="inline-block h-4 w-2 animate-pulse text-orange-600" aria-hidden />
                        </p>
                        <h1
                            data-reveal
                            className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-foreground sm:text-7xl"
                        >
                            {event?.title ?? "Build. Connect. Compete."}
                        </h1>
                        <p data-reveal className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Build. <span className="text-primary">Connect.</span> Compete.
                        </p>
                        <p data-reveal className="mt-6 max-w-xl text-lg leading-8 text-brand-muted-foreground">
                            {event?.description ??
                                "Step into the KBU hackathon workspace. Find your team, build something real, and get ready to compete."}
                        </p>
                        {event && (
                            <div
                                data-reveal
                                className="relative mt-8 max-w-2xl overflow-hidden rounded-2xl border border-orange-200/80 bg-white/70 shadow-lg shadow-orange-500/10 backdrop-blur-sm"
                            >
                                <div className="grid md:grid-cols-3">
                                    <div className="border-b border-orange-200/80 p-5 md:border-b-0 md:border-r">
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <CalendarDays className="size-4" />
                                            <p className="font-mono text-xs font-semibold tracking-wide">Hackathon</p>
                                        </div>
                                        <p className="mt-3 text-base font-bold leading-6 text-foreground">
                                            {formatDate(event.startsAt)}
                                            <span className="px-1 text-orange-500">–</span>
                                            {formatDate(event.endsAt)}
                                        </p>
                                    </div>
                                    <div className="border-b border-orange-200/80 p-5 md:border-b-0 md:border-r">
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <ClipboardPenLine className="size-4" />
                                            <p className="font-mono text-xs font-semibold tracking-wide">
                                                Registration
                                            </p>
                                        </div>
                                        <p className="mt-3 text-base font-bold leading-6 text-foreground">
                                            {formatDate(event.registrationOpensAt)}
                                            <span className="px-1 text-orange-500">–</span>
                                            {formatDate(event.registrationClosesAt)}
                                        </p>
                                    </div>
                                    {event.venue && (
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 text-orange-600">
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
                            <RegistrationButton state={registrationState} />
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-lg border border-orange-600 px-5 py-3 font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0"
                            >
                                ./sign-in
                            </Link>
                        </div>
                    </div>
                    <div data-reveal className="relative">
                        <div className="absolute -inset-4 rounded-4xl bg-orange-500/10 blur-2xl" aria-hidden />
                        <div className="relative overflow-hidden rounded-2xl glass shadow-2xl shadow-orange-500/10">
                            <div className="flex items-center gap-2 border-b border-slate-200/70 px-4 py-3">
                                <span className="size-3 rounded-full bg-rose-300" aria-hidden />
                                <span className="size-3 rounded-full bg-amber-300" aria-hidden />
                                <span className="size-3 rounded-full bg-emerald-300" aria-hidden />
                                <span className="ml-3 font-mono text-xs text-brand-muted-foreground">
                                    {event?.title ?? "event-preview"}
                                </span>
                            </div>
                            {eventImage ? (
                                <div className="relative aspect-[1672/941] w-full bg-orange-100">
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
                                <div className="relative aspect-[1672/941] w-full bg-orange-100">
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
                            <div className="border-t border-slate-200/70 px-5 py-3.5">
                                <Link
                                    href="/3d-demo"
                                    className="group inline-flex items-center gap-2 font-mono text-sm font-medium text-orange-600 transition hover:text-orange-700"
                                >
                                    walk_into_the_room
                                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Section divider — the gradient is reserved for CTAs, key
                    headlines, and dividers only. */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-accent" aria-hidden />
            </section>

            <section className="bg-orange-50/60">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <AboutContent />
                </div>
            </section>

            {/* Announcements */}
            <section className="relative bg-background border-t border-orange-100/80 dot-grid">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                        <div data-reveal>
                            <p className="font-mono text-sm font-medium text-orange-600">Latest announcements</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Latest from the community
                            </h2>
                            <p className="mt-4 text-brand-muted-foreground">
                                News, deadlines, and updates from the KBU Hackathon 2026.
                            </p>
                            <Link
                                href="/announcements"
                                className="mt-6 inline-flex items-center gap-1 font-semibold text-orange-600 transition hover:text-orange-700"
                            >
                                Read all announcements <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <Suspense fallback={<HomeAnnouncementsFallback />}>
                            <HomeAnnouncements />
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative bg-background border-t border-orange-100/80 dot-grid">
                <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <p className="font-mono text-sm font-medium text-orange-600">$ ready_to_build --join</p>
                    <h2
                        data-reveal
                        className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-tight text-foreground sm:text-5xl"
                    >
                        Your team is one commit away
                    </h2>
                    <p data-reveal className="mx-auto mt-5 max-w-xl text-brand-muted-foreground">
                        Register, find your team, and start building before the next kickoff.
                    </p>
                    <div data-reveal className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <RegistrationButton state={registrationState} />
                    </div>
                </div>
            </section>
        </main>
    );
}
