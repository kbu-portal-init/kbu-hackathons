import {
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    ClipboardCheck,
    Download,
    FileText,
    HelpCircle,
    Link2,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import { getEventSettings } from "@/lib/data/event-settings";

const references = [
    {
        icon: BookOpen,
        title: "Challenge brief",
        description: "Review the problem space, expected outcomes, and what your team should focus on building.",
        body: "Build a practical solution that creates meaningful value for the KBU community. Strong submissions clearly explain the problem, the people affected, and why the proposed solution matters.",
    },
    {
        icon: ClipboardCheck,
        title: "Rules & eligibility",
        description: "Keep your team within the event requirements throughout the hackathon.",
        body: "Use your registered team account, submit original work, respect other participants, and ensure every listed member has a valid verified student email.",
    },
    {
        icon: Trophy,
        title: "Judging criteria",
        description: "Use these criteria to guide your decisions from idea to final presentation.",
        body: "Projects are evaluated on problem relevance, usefulness, quality of execution, originality, technical choices, and how clearly the team communicates its solution.",
    },
    {
        icon: FileText,
        title: "Submission guide",
        description: "Prepare the information and links your team will need for final submission.",
        body: "Keep your repository, working demo, project description, and presentation materials ready. Check the Submit page for the final form and deadline once submissions open.",
    },
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export default async function TeamReferencesPage() {
    const event = await getEventSettings();

    return (
        <main className="space-y-8 p-6 lg:p-10">
            <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-orange-600">References</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    Everything your team needs to understand the challenge, prepare your project, and submit with
                    confidence.
                </p>
            </div>

            <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                    <CalendarDays className="size-5 text-orange-600" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-700">
                        Hackathon dates
                    </p>
                    <p className="mt-1 font-semibold text-zinc-950">
                        {event
                            ? `${formatDate(event.startsAt)} – ${formatDate(event.endsAt)}`
                            : "Dates to be announced"}
                    </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <ClipboardCheck className="size-5 text-orange-600" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Team size</p>
                    <p className="mt-1 font-semibold text-zinc-950">
                        {event ? `${event.minTeamSize}–${event.maxTeamSize} members` : "Check event rules"}
                    </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <Trophy className="size-5 text-orange-600" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Submission deadline
                    </p>
                    <p className="mt-1 font-semibold text-zinc-950">
                        {event ? formatDate(event.submissionDeadline) : "To be announced"}
                    </p>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
                {references.map(({ icon: Icon, title, description, body }) => (
                    <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm" key={title}>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                            <Icon className="size-5" />
                        </div>
                        <h2 className="mt-5 text-xl font-bold text-zinc-950">{title}</h2>
                        <p className="mt-2 text-sm font-medium text-orange-700">{description}</p>
                        <p className="mt-4 text-sm leading-6 text-zinc-600">{body}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Download className="size-5 text-orange-600" />
                        <h2 className="text-xl font-bold text-zinc-950">Downloads</h2>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                        Templates, presentation guidance, and official event files will be added here by the organizers.
                    </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link2 className="size-5 text-orange-600" />
                        <h2 className="text-xl font-bold text-zinc-950">Useful links</h2>
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link
                            className="flex items-center justify-between text-orange-700 hover:text-orange-900"
                            href="/team/submit"
                        >
                            <span>Open submission workspace</span>
                            <ArrowUpRight className="size-4" />
                        </Link>
                        <Link
                            className="flex items-center justify-between text-orange-700 hover:text-orange-900"
                            href="/resources"
                        >
                            <span>Explore student resources</span>
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-6">
                <HelpCircle className="mt-0.5 size-5 shrink-0 text-orange-600" />
                <div>
                    <h2 className="font-bold text-zinc-950">Need help?</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                        Ask your team leader to coordinate questions, or contact the event organizers before the
                        submission deadline.
                    </p>
                </div>
            </section>
        </main>
    );
}
