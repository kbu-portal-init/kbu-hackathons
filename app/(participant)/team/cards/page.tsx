import { ArrowLeft, IdCard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardCardGridSkeleton } from "@/components/dashboard-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamMembersForCards } from "@/lib/data/team-members";
import { MemberCards } from "./_components/member-cards";

export default async function TeamCardsPage() {
    const { team } = await requireApprovedTeam();

    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Participant workspace"
                title="Member cards"
                description="Generate and share a branded digital card for each team member."
                actions={
                    <Link className={buttonVariants({ variant: "outline" })} href="/team">
                        <ArrowLeft className="size-4" />
                        Back to overview
                    </Link>
                }
            />
            <Suspense fallback={<DashboardCardGridSkeleton />}>
                <MemberCardsContent teamId={team.id} />
            </Suspense>
        </main>
    );
}

async function MemberCardsContent({ teamId }: { teamId: string }) {
    const members = await getTeamMembersForCards(teamId);

    if (members.length === 0) {
        return (
            <div className="flex items-start gap-4 border-2 border-border/15 bg-card p-6">
                <IdCard className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                    <h2 className="font-display text-lg font-bold text-foreground">No team members yet</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Member cards become available once your roster is set.
                    </p>
                </div>
            </div>
        );
    }

    return <MemberCards members={members} />;
}
