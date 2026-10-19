import { Suspense } from "react";
import { DashboardCardGridSkeleton } from "@/components/dashboard-skeletons";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamMembersForCards } from "@/lib/data/team-members";
import { MemberCards } from "./_components/member-cards";

export default async function TeamsPage() {
    const { team } = await requireApprovedTeam();

    return (
        <main className="space-y-8">
            <header className="border-b-2 border-brand-ink/15 pb-5">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted-foreground">
                    Participant workspace
                </p>
                <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-[-0.03em] text-brand-ink">
                    {team.displayName}
                </h1>
                <p className="mt-3 max-w-2xl text-brand-muted-foreground">
                    Generate and share a branded digital card for each team member.
                </p>
            </header>
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
