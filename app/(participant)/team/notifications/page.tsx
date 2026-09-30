import { countTeamUnreadNotifications, listTeamNotifications } from "@/actions/participant/notifications";
import { NotificationInbox } from "./_components/notification-inbox";

export default async function TeamNotificationsPage() {
    const [result, unreadCount] = await Promise.all([
        listTeamNotifications({ page: 1, pageSize: 50 }),
        countTeamUnreadNotifications(),
    ]);
    return <NotificationInbox initial={result.ok ? result.data.items : []} unreadCount={unreadCount} />;
}
