import { Suspense } from "react";
import { countTeamUnreadNotifications, listTeamNotifications } from "@/actions/participant/notifications";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { NotificationInbox } from "./_components/notification-inbox";

export default function TeamNotificationsPage() {
    return (
        <Suspense fallback={<DashboardListSkeleton header />}>
            <TeamNotificationsContent />
        </Suspense>
    );
}

async function TeamNotificationsContent() {
    const [result, unreadCount] = await Promise.all([
        listTeamNotifications({ page: 1, pageSize: 50 }),
        countTeamUnreadNotifications(),
    ]);

    return <NotificationInbox initial={result.ok ? result.data.items : []} unreadCount={unreadCount} />;
}
