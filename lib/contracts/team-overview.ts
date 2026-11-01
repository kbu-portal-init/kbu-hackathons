import type { NotificationDTO } from "./notifications";
import type { SubmissionDTO } from "./submissions";

export type TeamOverviewMember = {
    id: string;
    name: string;
    role: string;
    studentEmail: string;
    imageUrl: string | null;
    verifiedAt: string | null;
};

export type TeamOverviewDTO = {
    approvedAt: string | null;
    members: TeamOverviewMember[];
    submission: SubmissionDTO | null;
    event: {
        submissionOpensAt: string;
        submissionDeadline: string;
    } | null;
    notifications: {
        unreadCount: number;
        latest: NotificationDTO[];
    };
};
