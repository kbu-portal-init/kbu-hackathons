import { ArrowRight, CalendarDays, Megaphone, Terminal, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import RoomExperience from "@/components/_3d/RoomExperience";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";

const events = [
    {
        index: "01",
        title: "KBU Innovation Sprint",
        date: "Coming soon",
        type: "Campus hackathon",
        description: "A weekend sprint to turn a blank repository into a working demo.",
    },
    {
        index: "02",
        title: "Open Build Weekend",
        date: "Registration opens soon",
        type: "Community event",
        description: "Open lab time with mentors, tooling, and room to experiment.",
    },
    {
        index: "03",
        title: "Future Tech Challenge",
        date: "Save the date",
        type: "Themed challenge",
        description: "A themed competition built around emerging technology.",
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

const gridBackground =
    "bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:56px_56px]";
const glowBackground = "bg-[radial-gradient(ellipse_70%_60%_at_70%_-10%,rgba(34,211,238,0.14),transparent)]";

export default async function Home() {
    await redirectAuthenticatedUser();

    return (
        <main className="overflow-hidden">
            {/* Hero — terminal-inspired dark band with the 3D workspace */}
            <section className={`relative ${gridBackground} bg-slate-950 ${glowBackground}`}>
                <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
                    <div>
                        <p className="inline-flex items-center gap-2 font-mono text-sm font-medium text-cyan-400">
                            <Terminal className="size-4" />
                            <span>$ kbu-hackathon --start</span>
                            <span className="inline-block h-4 w-2 animate-pulse bg-cyan-400" aria-hidden />
                        </p>
                        <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-7xl">
                            Build. Connect. <span className="text-cyan-400">Compete.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            Step into the KBU hackathon workspace. Find your next challenge, meet ambitious builders,
                            and turn bold ideas into something real.
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/events"
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                            >
                                Explore events
                                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-6 py-3 font-mono text-sm font-medium text-slate-200 transition hover:border-cyan-500/60 hover:text-cyan-300"
                            >
                                ./sign-in
                            </Link>
                        </div>
                        <p className="mt-8 font-mono text-xs text-slate-500">
                            next.js · prisma · better-auth · three.js
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-[2rem] bg-cyan-500/10 blur-2xl" aria-hidden />
                        <div className="relative">
                            <RoomExperience />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="max-w-2xl">
                    <p className="font-mono text-sm font-medium text-cyan-600 dark:text-cyan-400">
                        {"// how_it_works"}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From idea to demo</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">
                        Three steps separate an empty repository from a working demo on stage.
                    </p>
                </div>
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {features.map(({ icon: Icon, title, description }) => (
                        <article
                            key={title}
                            className="group relative rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/40 dark:hover:shadow-none"
                        >
                            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-400">
                                <Icon className="size-5" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Events */}
            <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-sm font-medium text-cyan-600 dark:text-cyan-400">
                                {"// upcoming_events"}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Save the dates</h2>
                        </div>
                        <Link
                            href="/events"
                            className="hidden items-center gap-1 font-mono text-sm font-medium text-cyan-600 hover:text-cyan-500 sm:flex dark:text-cyan-400"
                        >
                            view_all <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {events.map((event) => (
                            <Link
                                key={event.title}
                                href="/events"
                                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-100/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-500/40 dark:hover:shadow-none"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold text-slate-400">
                                        {event.index}
                                    </span>
                                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 font-mono text-xs font-medium text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                                        {event.type}
                                    </span>
                                </div>
                                <h3 className="mt-6 text-lg font-bold tracking-tight">{event.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    {event.description}
                                </p>
                                <p className="mt-5 flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                                    <CalendarDays className="size-3.5" /> {event.date}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Announcements */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    <div>
                        <p className="font-mono text-sm font-medium text-cyan-600 dark:text-cyan-400">
                            {"// announcements"}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Latest from the community
                        </h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                            News, deadlines, and updates from the KBU hackathon community.
                        </p>
                        <Link
                            href="/announcements"
                            className="mt-6 inline-flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
                        >
                            Read all announcements <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
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
                                key={announcement.title}
                                href="/announcements"
                                className="flex items-start gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-cyan-50/50 dark:border-slate-800/70 dark:hover:bg-cyan-950/20"
                            >
                                <Megaphone className="mt-0.5 size-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                                <div>
                                    <p className="font-mono text-xs font-medium text-cyan-600 dark:text-cyan-400">
                                        {announcement.tag}
                                    </p>
                                    <h3 className="mt-1.5 font-semibold">{announcement.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {announcement.body}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className={`${gridBackground} relative bg-slate-950 ${glowBackground}`}>
                <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <p className="font-mono text-sm font-medium text-cyan-400">$ ready_to_build --join</p>
                    <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Your team is one commit away
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-slate-300">
                        Register, find your team, and start building before the next kickoff.
                    </p>
                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                            Register a team
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-7 py-3 font-mono text-sm font-medium text-slate-200 transition hover:border-cyan-500/60 hover:text-cyan-300"
                        >
                            ./about
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
