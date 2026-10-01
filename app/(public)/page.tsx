import { ArrowRight, CalendarDays, ClipboardPenLine, MapPin, Megaphone, NotebookPen, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeAuthRedirect } from "@/app/(public)/_components/home-auth-redirect";
import ScrollFx from "@/components/scroll-fx";
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

const features = [
    {
        title: "Form your team",
        description: "Find builders with complementary skills and register a team in minutes.",
    },
    {
        title: "Pick a challenge",
        description: "Themed sprints and open build weekends, from kickoff to demo day.",
    },
    {
        title: "Ship and compete",
        description: "Present a working demo to judges, collect feedback, and win.",
    },
] as const;

const glowBackground = "bg-[radial-gradient(ellipse_70%_60%_at_70%_-10%,rgba(109,40,217,0.12),transparent)]";

export const dynamic = "force-dynamic";

export default async function Home() {
    const event = await getEventSettings();
    const eventImage = event?.imageUrls.find((url) => isOwnedR2PublicUrl(url, "uploads/events"));
    const now = Date.now();
    const registrationState =
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
                            <span>$ kbu-hackathon-2026 --start</span>
                            <span className="inline-block h-4 w-2 animate-pulse text-orange-600" aria-hidden />
                        </p>
                        <h1
                            data-reveal
                            className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-foreground sm:text-7xl"
                        >
                            {event?.title ?? "Build. Connect. Compete."}
                        </h1>
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
                            {registrationState === "open" ? (
                                <Link
                                    href="/register"
                                    className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600/90 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0"
                                >
                                    <NotebookPen className="size-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none" />
                                    Register Your Team
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-orange-600/45 px-5 py-3 font-semibold text-white/90 opacity-80"
                                >
                                    <NotebookPen className="size-5" />
                                    {registrationState === "not-started"
                                        ? "Registration opens soon"
                                        : registrationState === "closed"
                                          ? "Registration closed"
                                          : "Registration unavailable"}
                                </button>
                            )}
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
                                <div className="relative aspect-[4/3] w-full bg-orange-100">
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
                                <div className="flex aspect-[4/3] items-center justify-center bg-orange-50 px-6 text-center text-sm text-brand-muted-foreground">
                                    Event preview coming soon.
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

            {/* Features */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div data-reveal className="max-w-2xl">
                    <p className="font-mono text-sm font-medium text-orange-600">{"// how_it_works"}</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        From idea to demo
                    </h2>
                    <p className="mt-4 text-brand-muted-foreground">
                        Three steps separate an empty repository from a working demo on stage.
                    </p>
                </div>
                <div className="mt-12 py-8" data-reveal-group>
                    <div className="grid gap-8 md:grid-cols-3">
                        {features.map(({ title, description }, index) => (
                            <article key={title} data-reveal className="relative border-l-2 border-orange-300 pl-5">
                                <span className="font-mono text-3xl font-bold text-orange-600">0{index + 1}</span>
                                <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
                                <p className="mt-2 text-sm leading-7 text-brand-muted-foreground">{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Announcements */}
            <section className="relative bg-background border-t border-orange-100/80 dot-grid">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                        <div data-reveal>
                            <p className="font-mono text-sm font-medium text-orange-600">{"// announcements"}</p>
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
                        <div data-reveal className="overflow-hidden rounded-2xl glass">
                            {[
                                {
                                    tag: "community_update",
                                    title: "New hackathon opportunities are on the way",
                                    body: "Keep an eye on the events calendar for registration dates.",
                                },
                                {
                                    tag: "for_teams",
                                    title: "Prepare your team for the next challenge",
                                    body: "Explore resources and start shaping your idea.",
                                },
                            ].map((announcement) => (
                                <Link
                                    key={announcement.tag}
                                    href="/announcements"
                                    className="flex items-start gap-4 border-b border-orange-200 p-5 transition last:border-b-0 hover:bg-orange-50"
                                >
                                    <Megaphone className="mt-0.5 size-5 shrink-0 text-orange-600" />
                                    <div>
                                        <p className="font-mono text-xs font-medium text-orange-600">
                                            {announcement.tag}
                                        </p>
                                        <h3 className="mt-1.5 font-semibold text-foreground">{announcement.title}</h3>
                                        <p className="mt-1 text-sm text-brand-muted-foreground">{announcement.body}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
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
                        <Link
                            href="/register"
                            className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600/90 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0"
                        >
                            Register your team
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-600 px-5 py-3 font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0"
                        >
                            ./about
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
