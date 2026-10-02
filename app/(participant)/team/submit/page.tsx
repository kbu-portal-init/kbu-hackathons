import { requireApprovedTeam } from "@/lib/auth/guards";
import { getEventSettings } from "@/lib/data/event-settings";
import { getTeamSubmission } from "@/lib/data/submissions";
import { SubmissionForm } from "./_components/submission-form";

export default async function TeamSubmitPage() {
    const { team } = await requireApprovedTeam();
    const [submission, event] = await Promise.all([getTeamSubmission(team.id), getEventSettings()]);

    return (
        <main className="max-w-4xl">
            <p className="text-sm font-semibold text-orange-600">Participant workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Submit your project</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
                Save a draft while you work, then finalize it before the configured deadline.
            </p>
            {event && (
                <p className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
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
        </main>
    );
}
