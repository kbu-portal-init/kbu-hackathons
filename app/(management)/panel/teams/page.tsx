import { Suspense } from "react";
import { listTeams } from "@/actions/management/teams";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { TeamManagement } from "./_components/team-management";

export default function PanelTeamsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="All teams"
                description="Browse approved teams and monitor their submissions."
            />
            <Suspense fallback={<DashboardListSkeleton />}>
                {searchParams.then(({ page, status }) => (
                    <TeamListContent page={page} status={status} />
                ))}
            </Suspense>
        </main>
    );
}

async function TeamListContent({ page, status }: { page?: string; status?: string }) {
    const normalizedStatus = status === "ACTIVE" || status === "BANNED" ? status : undefined;
    const result = await listTeams({ page: page ? Number(page) : 1, pageSize: 20, status: normalizedStatus });
    if (!result.ok) throw new Error(result.error.message);

    return <TeamManagement items={result.data.items} meta={result.data.meta} status={normalizedStatus} />;
}
