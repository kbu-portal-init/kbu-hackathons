import "server-only";

import type { SubmissionDTO } from "@/lib/contracts/submissions";

export type SubmissionWindowState = "NOT_CONFIGURED" | "BEFORE_OPEN" | "OPEN" | "CLOSED";

export type TeamOverviewActionId =
    | "VERIFY_MEMBERS"
    | "SUBMIT_PROJECT"
    | "SUBMIT_CLOSED"
    | "READ_NOTIFICATIONS"
    | "UP_TO_DATE";

export function getSubmissionWindowState(
    event: { submissionOpensAt: string; submissionDeadline: string } | null,
    now = new Date(),
): SubmissionWindowState {
    if (!event) return "NOT_CONFIGURED";
    if (now < new Date(event.submissionOpensAt)) return "BEFORE_OPEN";
    if (now > new Date(event.submissionDeadline)) return "CLOSED";
    return "OPEN";
}

export function deriveTeamOverviewActions(input: {
    unverifiedMemberCount: number;
    submissionStatus: SubmissionDTO["status"] | null;
    windowState: SubmissionWindowState;
    unreadNotificationCount: number;
}): TeamOverviewActionId[] {
    const actions: TeamOverviewActionId[] = [];

    if (input.unverifiedMemberCount > 0) actions.push("VERIFY_MEMBERS");

    const needsSubmission =
        input.submissionStatus === null || input.submissionStatus === "DRAFT" || input.submissionStatus === "REOPENED";

    if (needsSubmission) {
        if (input.windowState === "OPEN") actions.push("SUBMIT_PROJECT");
        else if (input.windowState === "CLOSED") actions.push("SUBMIT_CLOSED");
    }

    if (input.unreadNotificationCount > 0) actions.push("READ_NOTIFICATIONS");

    return actions.length > 0 ? actions : ["UP_TO_DATE"];
}
