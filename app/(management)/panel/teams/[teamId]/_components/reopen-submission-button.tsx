"use client";

import { reopenTeamSubmission } from "@/actions/management/submissions";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import { Button } from "@/components/ui/button";

export function ReopenSubmissionButton({ submissionId }: { submissionId: string }) {
    return (
        <ConfirmActionAlertDialog
            trigger={
                <Button variant="outline" size="sm">
                    Reopen for editing
                </Button>
            }
            title="Reopen submission?"
            description="The team will be able to edit and resubmit this project."
            confirmLabel="Reopen submission"
            pendingLabel="Reopening..."
            onConfirm={async () => {
                const result = await reopenTeamSubmission(submissionId);
                if (!result.ok) return false;
                window.location.reload();
                return true;
            }}
        />
    );
}
