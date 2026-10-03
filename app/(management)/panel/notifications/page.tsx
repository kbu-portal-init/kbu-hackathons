import { Suspense } from "react";
import { listTeams } from "@/actions/management/teams";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import type { TeamListItem } from "@/lib/contracts/teams";
import { NotificationComposer } from "./_components/notification-composer";

export default function NotificationsPage() {
    return (
        <Suspense fallback={<DashboardFormSkeleton header />}>
            <NotificationComposerContent />
        </Suspense>
    );
}

async function NotificationComposerContent() {
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
