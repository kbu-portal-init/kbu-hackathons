import { Suspense } from "react";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getEventSettings } from "@/lib/data/event-settings";
import { getTeamSubmission } from "@/lib/data/submissions";
import { SubmissionForm } from "./_components/submission-form";

export default async function TeamSubmitPage() {
    const { team } = await requireApprovedTeam();

    return (
        <main className="max-w-4xl">
            <header className="border-b-2 border-border/15 pb-5">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Participant workspace
                </p>
                <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                    Submit your project
                </h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                    Save a draft while you work, then finalize it before the configured deadline.
                </p>
            </header>
            <Suspense fallback={<DashboardFormSkeleton />}>
                <SubmissionContent teamId={team.id} />
            </Suspense>
        </main>
    );
}

async function SubmissionContent({ teamId }: { teamId: string }) {
    const [submission, event] = await Promise.all([getTeamSubmission(teamId), getEventSettings()]);

    return (
        <>
            {event && (
                <p className="mt-4 border-2 border-border bg-accent p-4 text-sm font-medium text-accent-foreground">
                    Submission window:{" "}
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(event.submissionOpensAt),
                    )}{" "}
                    to{" "}
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(event.submissionDeadline),
                    )}
                </p>
            )}
            <SubmissionForm submission={submission} />
        </>
    );
}
