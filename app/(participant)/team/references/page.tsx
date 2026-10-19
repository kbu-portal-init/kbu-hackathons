import {
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    ClipboardCheck,
    FileText,
    HelpCircle,
    Link2,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventSettings } from "@/lib/data/event-settings";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

const references = [
    {
        id: "challenge-brief",
        icon: BookOpen,
        title: "Challenge brief",
        description: "Prepare for the challenge direction that will be announced when the event begins.",
        body: "The final theme and scope will be revealed at kickoff. Your team will choose its own problem and solution within the announced direction, then explain the users affected and why the solution matters.",
    },
    {
        id: "rules-eligibility",
        icon: ClipboardCheck,
        title: "Rules & eligibility",
        description: "Keep your team within the event requirements throughout the hackathon.",
        body: "Use your registered team account, submit original work, respect other participants, and ensure every listed member has a valid verified student email. You may prepare tools and general skills beforehand, but challenge-specific implementation must begin after kickoff. Any technology is allowed unless the event team announces otherwise.",
    },
    {
        id: "judging-criteria",
        icon: Trophy,
        title: "Judging criteria",
        description: "Use these criteria to guide your decisions from idea to final presentation.",
        body: "Projects are evaluated on problem relevance, usefulness, quality of execution, originality, technical choices, and how clearly the team communicates its solution.",
    },
    {
        id: "submission-guide",
        icon: FileText,
        title: "Submission guide",
        description: "Prepare the information and links your team will need for final submission.",
        body: "Keep your repository, working demo, project description, and presentation materials ready. The event team will confirm the final submission requirements at kickoff. Check the Submit page for the form and deadline.",
    },
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export default async function TeamReferencesPage() {
    const t = getMessages(await getLocale()).references;
    return (
        <main className="space-y-8">
            <header className="border-b-2 border-border/15 pb-5">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Participant references
                </p>
                <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                    {t.title}
                </h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">{t.intro}</p>
            </header>

            <Suspense fallback={<EventFactsSkeleton />}>
                <EventFacts />
            </Suspense>

            <section className="grid gap-5 lg:grid-cols-2">
                {references.map(({ icon: Icon, body, id }, index) => {
                    const [title, description] = t.cards[index];
                    return (
                        <article className="border-2 border-border bg-card p-6" key={id}>
                            <div className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
                                <Icon className="size-5" />
                            </div>
                            <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
                                {title}
                            </h2>
                            <p className="mt-2 text-sm font-medium text-muted-foreground">{description}</p>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">{body}</p>
                        </article>
                    );
                })}
            </section>

            <section className="grid gap-5">
                <div className="border-2 border-border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <Link2 className="size-5 text-primary" />
                        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {t.usefulLinks}
                        </h2>
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link
                            className="flex items-center justify-between font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:bg-accent hover:text-accent-foreground"
                            href="/team/submit"
                        >
                            <span>{t.submissionWorkspace}</span>
                            <ArrowUpRight className="size-4" />
                        </Link>
                        <Link
                            className="flex items-center justify-between font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:bg-accent hover:text-accent-foreground"
                            href="/resources"
                        >
                            <span>{t.studentResources}</span>
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="flex items-start gap-4 border-2 border-border/15 bg-background p-6">
                <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                    <h2 className="font-display text-lg font-bold text-foreground">{t.help}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.helpText}</p>
                </div>
            </section>
        </main>
    );
}

async function EventFacts() {
    const event = await getEventSettings();

    return (
        <section className="grid gap-4 sm:grid-cols-3">
            <div className="border-2 border-border/15 bg-background p-5">
                <CalendarDays className="size-5 text-primary" />
                <p className="mt-4 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Hackathon dates
                </p>
                <p className="mt-1 font-semibold text-foreground">
                    {event ? `${formatDate(event.startsAt)} – ${formatDate(event.endsAt)}` : "Dates to be announced"}
                </p>
            </div>
            <div className="border-2 border-border bg-card p-5">
                <ClipboardCheck className="size-5 text-primary" />
                <p className="mt-4 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Team size
                </p>
                <p className="mt-1 font-semibold text-foreground">
                    {event ? `${event.minTeamSize}–${event.maxTeamSize} members` : "Check event rules"}
                </p>
            </div>
            <div className="border-2 border-border bg-card p-5">
                <Trophy className="size-5 text-primary" />
                <p className="mt-4 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Submission deadline
                </p>
                <p className="mt-1 font-semibold text-foreground">
                    {event ? formatDate(event.submissionDeadline) : "To be announced"}
                </p>
            </div>
        </section>
    );
}

function EventFactsSkeleton() {
    return (
        <div role="status" aria-label="Loading event details">
            <span className="sr-only">Loading event details</span>
            <div className="grid gap-4 sm:grid-cols-3">
                {["one", "two", "three"].map((key) => (
                    <div className="border-2 border-border bg-card p-5" key={key}>
                        <Skeleton className="size-5 bg-accent text-accent-foreground" />
                        <Skeleton className="mt-4 h-4 w-28 bg-background" />
                        <Skeleton className="mt-2 h-5 w-40 max-w-full bg-background" />
                    </div>
                ))}
            </div>
        </div>
    );
}
