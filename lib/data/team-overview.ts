import "server-only";

import type { TeamOverviewDTO } from "@/lib/contracts/team-overview";
import { getEventSettings } from "@/lib/data/event-settings";
import { countUnreadNotifications, listNotifications } from "@/lib/data/notifications";
import { getTeamSubmission } from "@/lib/data/submissions";
import { getTeamApprovalDate, getTeamMembersOverview } from "@/lib/data/team-members";

export async function getTeamOverview(teamId: string, userId: string): Promise<TeamOverviewDTO> {
    const [approvedAt, members, submission, event, notifications, unreadCount] = await Promise.all([
        getTeamApprovalDate(teamId),
        getTeamMembersOverview(teamId),
        getTeamSubmission(teamId),
        getEventSettings(),
        listNotifications(userId, { page: 1, pageSize: 3 }),
        countUnreadNotifications(userId),
    ]);

    return {
        approvedAt,
        members,
        submission,
        event: event
            ? {
                  submissionOpensAt: event.submissionOpensAt,
                  submissionDeadline: event.submissionDeadline,
              }
            : null,
        notifications: {
            unreadCount,
            latest: notifications.items,
        },
    };
}
