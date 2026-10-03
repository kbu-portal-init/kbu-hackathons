import { Suspense } from "react";
import { listTeams } from "@/actions/management/teams";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { TeamManagement } from "./_components/team-management";

export default function PanelTeamsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    return (
        <Suspense fallback={<DashboardListSkeleton header />}>
            <TeamListContent searchParams={searchParams} />
        </Suspense>
    );
}

async function TeamListContent({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
    const params = await searchParams;
    const status = params.status === "ACTIVE" || params.status === "BANNED" ? params.status : undefined;
    const result = await listTeams({ page: params.page ? Number(params.page) : 1, pageSize: 20, status });
    if (!result.ok) throw new Error(result.error.message);

    return <TeamManagement items={result.data.items} meta={result.data.meta} status={status} />;
}
