import { Suspense } from "react";
import { DashboardCardGridSkeleton } from "@/components/dashboard-skeletons";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamMembersForCards } from "@/lib/data/team-members";
import { MemberCards } from "./_components/member-cards";

export default async function TeamsPage() {
    const { team } = await requireApprovedTeam();

    return (
        <main className="space-y-8">
            <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-orange-600">{team.displayName}</h1>
                <p className="mt-2 text-muted-foreground">
                    Generate and share a branded digital card for each team member.
                </p>
            </div>
            <Suspense fallback={<DashboardCardGridSkeleton />}>
                <MemberCardsContent teamId={team.id} />
            </Suspense>
        </main>
    );
}

async function MemberCardsContent({ teamId }: { teamId: string }) {
    const members = await getTeamMembersForCards(teamId);

    return <MemberCards members={members} />;
}
