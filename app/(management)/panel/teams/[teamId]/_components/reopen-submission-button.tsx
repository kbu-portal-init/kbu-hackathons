"use client";

import { useTransition } from "react";
import { reopenTeamSubmission } from "@/actions/management/submissions";

export function ReopenSubmissionButton({ submissionId }: { submissionId: string }) {
    const [pending, startTransition] = useTransition();
    return (
        <button
            className="rounded-md border border-orange-600 px-3 py-2 text-sm font-semibold text-orange-700 disabled:opacity-50"
            disabled={pending}
            type="button"
            onClick={() => {
                if (!window.confirm("Reopen this submission for editing?")) return;
                startTransition(async () => {
                    await reopenTeamSubmission(submissionId);
                    window.location.reload();
                });
            }}
        >
            {pending ? "Reopening..." : "Reopen for editing"}
        </button>
    );
}
