import { ArrowRight, CalendarDays, Megaphone, Terminal, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { HomeAuthRedirect } from "@/app/(public)/_components/home-auth-redirect";
import { ScenePlaceholder } from "@/components/scene-placeholder";
import ScrollFx from "@/components/scroll-fx";

const events = [
    {
        index: "01",
        title: "KBU Innovation Sprint",
        date: "Coming soon",
        type: "Campus hackathon",
        description: "A weekend sprint to turn a blank repository into a working demo.",
        art: "scene-sprint",
    },
    {
        index: "02",
        title: "Open Build Weekend",
        date: "Registration opens soon",
        type: "Community event",
        description: "Open lab time with mentors, tooling, and room to experiment.",
        art: "scene-lab",
    },
    {
        index: "03",
        title: "Future Tech Challenge",
        date: "Save the date",
        type: "Themed challenge",
        description: "A themed competition built around emerging technology.",
        art: "scene-challenge",
    },
] as const;

const features = [
    {
        icon: Users,
        title: "Form your team",
        description: "Find builders with complementary skills and register a team in minutes.",
    },
    {
        icon: Zap,
        title: "Pick a challenge",
        description: "Themed sprints and open build weekends, from kickoff to demo day.",
    },
    {
        icon: Trophy,
        title: "Ship and compete",
        description: "Present a working demo to judges, collect feedback, and win.",
    },
] as const;

const glowBackground = "bg-[radial-gradient(ellipse_70%_60%_at_70%_-10%,rgba(109,40,217,0.12),transparent)]";

export default async function Home() {
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
                            className="inline-flex items-center gap-2 font-mono text-sm font-medium text-teal-600"
                        >
                            <Terminal className="size-4" />
                            <span>$ kbu-hackathon --start</span>
                            <span className="inline-block h-4 w-2 animate-pulse bg-teal-600" aria-hidden />
                        </p>
                        <h1
                            data-reveal
                            className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-foreground sm:text-7xl"
                        >
                            Build. Connect. <span className="text-gradient">Compete.</span>
                        </h1>
                        <p data-reveal className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                            Step into the KBU hackathon workspace. Find your next challenge, meet ambitious builders,
                            and turn bold ideas into something real.
                        </p>
                        <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/events"
                                className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600/90 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0"
                            >
                                <NotebookPen className="size-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none" />
                                Register Your Team
                            </Link>
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
                                <span className="ml-3 font-mono text-xs text-muted-foreground">
                                    kbu-hub — first build
                                </span>
                            </div>
                            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7 text-foreground">
                                <span className="block">
                                    <span className="text-muted-foreground">$</span>{" "}
                                    <span className="font-semibold">pnpm create hackathon</span>
                                </span>
                                <span className="block">
                                    <span className="text-emerald-600">✔</span> workspace ready
                                </span>
                                <span className="block">
                                    <span className="text-muted-foreground">$</span>{" "}
                                    <span className="font-semibold">git checkout -b feat/your-idea</span>
                                </span>
                                <span className="block">
                                    <span className="text-emerald-600">✔</span> branch created
                                </span>
                                <span className="block">
                                    <span className="text-muted-foreground">$</span>{" "}
                                    <span className="font-semibold">pnpm dev</span>
                                    <span
                                        className="ml-1 inline-block h-4 w-2 animate-pulse bg-orange-600 align-middle"
                                        aria-hidden
                                    />
                                </span>
                                <span className="block text-orange-700">➜ ready — bring an idea</span>
                            </pre>
                            <div className="border-t border-slate-200/70 px-5 py-3.5">
                                <Link
                                    href="/3d-demo"
                                    className="group inline-flex items-center gap-2 font-mono text-sm font-medium text-orange-700 transition hover:text-orange-800"
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
                    <p className="font-mono text-sm font-medium text-teal-600">{"// how_it_works"}</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        From idea to demo
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Three steps separate an empty repository from a working demo on stage.
                    </p>
                </div>
                <div className="mt-12 grid gap-5 md:grid-cols-3" data-reveal-group>
                    {features.map(({ icon: Icon, title, description }) => (
                        <article
                            key={title}
                            data-reveal
                            className="group relative overflow-hidden rounded-2xl glass p-7 transition hover:border-orange-500/40"
                        >
                            <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-200">
                                <Icon className="size-5" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">{title}</h3>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Events */}
            <section className="border-y border-orange-200 bg-secondary/50">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div data-reveal className="flex items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-sm font-medium text-teal-600">{"// upcoming_events"}</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Save the dates
                            </h2>
                        </div>
                        <Link
                            href="/events"
                            className="hidden items-center gap-1 font-mono text-sm font-medium text-teal-600 transition hover:text-teal-700 sm:flex"
                        >
                            view_all <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-3" data-reveal-group>
                        {events.map((event) => (
                            <Link
                                key={event.title}
                                href="/events"
                                data-reveal
                                className="group flex flex-col overflow-hidden rounded-2xl glass-accent transition duration-300 hover:-translate-y-1 hover:border-orange-500/50"
                            >
                                {/* 3D-scene placeholder where the room render will go */}
                                <div className="relative aspect-[16/10] overflow-hidden border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-teal-50/60">
                                    <span className="sr-only">{event.title} preview</span>
                                    <ScenePlaceholder variant={event.art} />
                                </div>
                                <div className="flex flex-col gap-3 p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                                            {event.index}
                                        </span>
                                        <span className="rounded-full bg-teal-100 px-2.5 py-1 font-mono text-xs font-medium text-teal-800">
                                            {event.type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">{event.title}</h3>
                                    <p className="text-sm leading-7 text-muted-foreground">{event.description}</p>
                                    <p className="mt-auto flex items-center gap-2 pt-3 font-mono text-xs text-muted-foreground">
                                        <CalendarDays className="size-3.5" /> {event.date}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mx-auto mt-16 h-px w-2/3 bg-gradient-accent" aria-hidden />
                </div>
            </section>

            {/* Announcements */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    <div data-reveal>
                        <p className="font-mono text-sm font-medium text-teal-600">{"// announcements"}</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Latest from the community
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            News, deadlines, and updates from the KBU hackathon community.
                        </p>
                        <Link
                            href="/announcements"
                            className="mt-6 inline-flex items-center gap-1 font-semibold text-teal-600 transition hover:text-teal-700"
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
                                <Megaphone className="mt-0.5 size-5 shrink-0 text-teal-600" />
                                <div>
                                    <p className="font-mono text-xs font-medium text-teal-600">{announcement.tag}</p>
                                    <h3 className="mt-1.5 font-semibold text-foreground">{announcement.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{announcement.body}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative bg-background dot-grid mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]">
                <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    {/* 3D-scene placeholder where the room render will go */}
                    <div className="relative mx-auto mb-10 aspect-[16/7] max-w-4xl overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-teal-50/60">
                        <span className="sr-only">The KBU hackathon workspace</span>
                        <ScenePlaceholder variant="scene-hero" />
                    </div>
                    <p data-reveal className="font-mono text-sm font-medium text-teal-600">
                        $ ready_to_build --join
                    </p>
                    <h2
                        data-reveal
                        className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-tight text-foreground sm:text-5xl"
                    >
                        Your team is one commit away
                    </h2>
                    <p data-reveal className="mx-auto mt-5 max-w-xl text-muted-foreground">
                        Register, find your team, and start building before the next kickoff.
                    </p>
                    <div data-reveal className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-7 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/40"
                        >
                            Register a team
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-400 bg-orange-50 px-7 py-3 font-mono text-sm font-medium text-orange-700 transition hover:border-orange-600 hover:text-orange-800"
                        >
                            ./about
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
