import { CalendarDays, ClipboardPenLine, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    const event = await getEventSettings();
    const eventImages = event?.imageUrls.filter((url) => isOwnedR2PublicUrl(url, "uploads/events")).slice(0, 2) ?? [];

    return (
        <main className="flex-1 bg-orange-50/60">
            <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
                <p className="font-mono text-sm font-medium text-orange-600">{"// about_kbu_hackathon_2026"}</p>
                <h1 className="mt-5 whitespace-nowrap text-[clamp(2rem,7vw,4.5rem)] font-black tracking-tight text-foreground">
                    {event?.title ?? "KBU Hackathon 2026"}
                </h1>
                <p className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Build. <span className="text-primary">Connect.</span> Compete.
                </p>
                {event ? (
                    <>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-muted-foreground">
                            {event.description ||
                                "Bring your team, turn an ambitious idea into a working prototype, and share what you build with the KBU community."}
                        </p>

                        {eventImages[0] && (
                            <figure className="relative mt-10 aspect-[16/7] max-w-4xl overflow-hidden rounded-2xl bg-orange-100">
                                <Image
                                    src={eventImages[0]}
                                    alt={`${event.title} event image`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 896px"
                                    priority
                                />
                            </figure>
                        )}

                        <dl className="mt-12 max-w-3xl border-y border-orange-200">
                            <div className="grid gap-2 border-b border-orange-200 py-5 sm:grid-cols-[11rem_1fr] sm:items-center">
                                <dt className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide text-orange-600">
                                    <CalendarDays className="size-4" />
                                    Hackathon
                                </dt>
                                <dd className="text-lg font-bold text-foreground">
                                    {formatDate(event.startsAt)} – {formatDate(event.endsAt)}
                                </dd>
                            </div>
                            <div className="grid gap-2 border-b border-orange-200 py-5 sm:grid-cols-[11rem_1fr] sm:items-center">
                                <dt className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide text-orange-600">
                                    <ClipboardPenLine className="size-4" />
                                    Registration
                                </dt>
                                <dd className="text-lg font-bold text-foreground">
                                    {formatDate(event.registrationOpensAt)} – {formatDate(event.registrationClosesAt)}
                                </dd>
                            </div>
                            <div className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr] sm:items-center">
                                <dt className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide text-orange-600">
                                    <MapPin className="size-4" />
                                    Venue
                                </dt>
                                <dd className="text-lg font-bold text-foreground">
                                    {event.venue || "KBU Innovation Lab"}
                                </dd>
                            </div>
                            <div className="grid gap-2 border-t border-orange-200 py-5 sm:grid-cols-[11rem_1fr] sm:items-center">
                                <dt className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide text-orange-600">
                                    <Users className="size-4" />
                                    Team size
                                </dt>
                                <dd className="text-lg font-bold text-foreground">
                                    {event.minTeamSize} to {event.maxTeamSize} members
                                </dd>
                            </div>
                        </dl>

                        {eventImages[1] && (
                            <figure className="relative mt-10 aspect-[16/6] max-w-4xl overflow-hidden rounded-2xl bg-orange-100">
                                <Image
                                    src={eventImages[1]}
                                    alt={`${event.title} event image 2`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 896px"
                                />
                            </figure>
                        )}

                        <Link
                            href="/register"
                            className="mt-9 inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600/90 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0"
                        >
                            Register Your Team
                        </Link>
                    </>
                ) : (
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-muted-foreground">
                        Event details will be available soon. Check back when registration opens.
                    </p>
                )}
            </section>
        </main>
    );
}
