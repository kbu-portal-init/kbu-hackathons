import { Suspense } from "react";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamApprovalDate, getTeamMembersForCards } from "@/lib/data/team-members";
import { TeamPasswordSettings } from "./_components/team-password-settings";
import { TeamSettingsForm } from "./_components/team-settings-form";

export default async function TeamSettingsPage() {
    const { team } = await requireApprovedTeam();

    return (
        <main className="space-y-8">
            <header className="border-b-2 border-brand-ink/15 pb-5">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted-foreground">
                    Participant workspace
                </p>
                <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-[-0.03em] text-brand-ink">
                    Team settings
                </h1>
                <p className="mt-3 max-w-2xl text-brand-muted-foreground">
                    Manage your team identity, member presentation, and shared account access.
                </p>
            </header>
            <Suspense fallback={<DashboardFormSkeleton />}>
                <TeamSettingsContent
                    team={{ displayName: team.displayName, imageUrl: team.imageUrl, loginName: team.loginName }}
                    teamId={team.id}
                />
            </Suspense>
        </main>
    );
}

async function TeamSettingsContent({
    team,
    teamId,
}: {
    team: { displayName: string; imageUrl: string | null; loginName: string };
    teamId: string;
}) {
    const [members, approvalDate] = await Promise.all([getTeamMembersForCards(teamId), getTeamApprovalDate(teamId)]);

    return (
        <>
            <TeamSettingsForm
                members={members}
                team={{
                    displayName: team.displayName,
                    imageUrl: team.imageUrl,
                    loginName: team.loginName,
                    approvalDate,
                }}
            />
            <TeamPasswordSettings username={team.loginName} />
        </>
    );
}
