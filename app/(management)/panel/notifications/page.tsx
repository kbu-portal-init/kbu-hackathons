import { listTeams } from "@/actions/management/teams";
import type { TeamListItem } from "@/lib/contracts/teams";
import { NotificationComposer } from "./_components/notification-composer";

export default async function NotificationsPage() {
    const allTeams: TeamListItem[] = [];
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage) {
        const teams = await listTeams({ page, pageSize: 100, status: "ACTIVE" });
        if (!teams.ok) break;
        allTeams.push(...teams.data.items);
        hasNextPage = teams.data.meta.hasNextPage;
        page += 1;
    }
    return <NotificationComposer teams={allTeams} />;
}
