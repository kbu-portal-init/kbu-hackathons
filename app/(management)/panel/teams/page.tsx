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
                <TeamListContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function TeamListContent({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
    const params = await searchParams;
    const status = params.status === "ACTIVE" || params.status === "BANNED" ? params.status : undefined;
    const result = await listTeams({ page: params.page ? Number(params.page) : 1, pageSize: 20, status });
    if (!result.ok) throw new Error(result.error.message);

    return <TeamManagement items={result.data.items} meta={result.data.meta} status={status} />;
}
