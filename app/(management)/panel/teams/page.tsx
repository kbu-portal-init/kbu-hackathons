import { listTeams } from "@/actions/management/teams";
import { TeamManagement } from "./_components/team-management";

export default async function PanelTeamsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const status = params.status === "ACTIVE" || params.status === "BANNED" ? params.status : undefined;
    const result = await listTeams({ page: params.page ? Number(params.page) : 1, pageSize: 20, status });
    if (!result.ok) throw new Error(result.error.message);
    return <TeamManagement items={result.data.items} meta={result.data.meta} status={status} />;
}
