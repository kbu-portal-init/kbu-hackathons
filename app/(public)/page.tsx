import { ArrowRight, CalendarDays, Megaphone, Users } from "lucide-react";
import Link from "next/link";

const events = [
    ["KBU Innovation Sprint", "Coming soon", "Campus hackathon"],
    ["Open Build Weekend", "Registration opens soon", "Community event"],
    ["Future Tech Challenge", "Save the date", "Themed challenge"],
] as const;

export default function Home() {
    return (
        <main>
            <section className="overflow-hidden border-b border-orange-100 bg-orange-50 dark:border-orange-950/50 dark:bg-orange-950/20">
                <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
                    <div>
                        <p className="mb-5 inline-flex rounded-full border border-orange-200 bg-white px-3 py-1 text-sm font-semibold text-orange-700 dark:border-orange-900 dark:bg-zinc-950 dark:text-orange-300">
                            The KBU hackathon community
                        </p>
                        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-zinc-950 sm:text-7xl dark:text-white">
                            Build. Connect. <span className="text-orange-600">Compete.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                            Find your next challenge, meet ambitious builders, and turn bold ideas into something real
                            with KBU Hub.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
                            >
                                Explore events <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-orange-700 dark:border-orange-900 dark:bg-zinc-950 dark:text-orange-300"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                    <div className="relative hidden min-h-72 lg:block">
                        <div className="absolute right-8 top-4 size-56 rounded-full bg-orange-300/50 blur-3xl dark:bg-orange-600/30" />
                        <div className="relative ml-auto max-w-sm rounded-3xl border border-orange-200 bg-white p-7 shadow-xl shadow-orange-200/40 dark:border-orange-900 dark:bg-zinc-900 dark:shadow-none">
                            <p className="text-sm font-semibold text-orange-600">What’s happening</p>
                            <p className="mt-4 text-3xl font-bold tracking-tight">Ideas start here.</p>
                            <div className="mt-8 space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
                                <p className="flex items-center gap-3">
                                    <CalendarDays className="size-5 text-orange-600" /> Discover upcoming events
                                </p>
                                <p className="flex items-center gap-3">
                                    <Users className="size-5 text-orange-600" /> Find your people
                                </p>
                                <p className="flex items-center gap-3">
                                    <Megaphone className="size-5 text-orange-600" /> Stay in the loop
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Get involved</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight">Upcoming events</h2>
                    </div>
                    <Link
                        href="/events"
                        className="hidden items-center gap-1 text-sm font-semibold text-orange-600 sm:flex"
                    >
                        View all events <ArrowRight className="size-4" />
                    </Link>
                </div>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {events.map(([title, date, type]) => (
                        <article
                            key={title}
                            className="rounded-2xl border border-zinc-200 p-6 hover:shadow-lg hover:shadow-orange-100 dark:border-zinc-800 dark:hover:shadow-none"
                        >
                            <p className="text-sm font-medium text-orange-600">{type}</p>
                            <h3 className="mt-8 text-xl font-bold">{title}</h3>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{date}</p>
                            <Link
                                href="/events"
                                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold hover:text-orange-600"
                            >
                                Learn more <ArrowRight className="size-4" />
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
            <section className="bg-zinc-50 dark:bg-zinc-900/50">
                <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Stay informed</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight">Latest announcements</h2>
                        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
                            News, deadlines, and updates from the KBU hackathon community.
                        </p>
                        <Link
                            href="/announcements"
                            className="mt-6 inline-flex items-center gap-1 font-semibold text-orange-600"
                        >
                            Read all announcements <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                        <Link
                            href="/announcements"
                            className="block p-5 hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                                Community update
                            </p>
                            <h3 className="mt-2 font-semibold">New hackathon opportunities are on the way</h3>
                            <p className="mt-1 text-sm text-zinc-500">
                                Keep an eye on the events calendar for registration dates.
                            </p>
                        </Link>
                        <Link
                            href="/announcements"
                            className="block p-5 hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">For teams</p>
                            <h3 className="mt-2 font-semibold">Prepare your team for the next challenge</h3>
                            <p className="mt-1 text-sm text-zinc-500">Explore resources and start shaping your idea.</p>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
