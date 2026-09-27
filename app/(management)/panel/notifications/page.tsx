import { listTeams } from "@/actions/management/teams";
import { NotificationComposer } from "./_components/notification-composer";

export default async function NotificationsPage() {
    const teams = await listTeams({ page: 1, pageSize: 100, status: "ACTIVE" });
    return <NotificationComposer teams={teams.ok ? teams.data.items : []} />;
}
