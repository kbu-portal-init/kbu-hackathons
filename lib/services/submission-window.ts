export type SubmissionWindowState = "NOT_CONFIGURED" | "BEFORE_OPEN" | "OPEN" | "CLOSED";

type SubmissionWindow = {
    submissionOpensAt: Date | string;
    submissionDeadline: Date | string;
};

export function getSubmissionWindowState(event: SubmissionWindow | null, now = new Date()): SubmissionWindowState {
    if (!event) return "NOT_CONFIGURED";
    const opensAt =
        event.submissionOpensAt instanceof Date ? event.submissionOpensAt : new Date(event.submissionOpensAt);
    const deadline =
        event.submissionDeadline instanceof Date ? event.submissionDeadline : new Date(event.submissionDeadline);
    if (now < opensAt) return "BEFORE_OPEN";
    if (now > deadline) return "CLOSED";
    return "OPEN";
}
