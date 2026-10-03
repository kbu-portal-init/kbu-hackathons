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
            <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-orange-600">Team settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your team identity, member presentation, and shared account access.
                </p>
            </div>
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
