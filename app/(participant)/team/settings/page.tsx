import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamApprovalDate, getTeamMembersForCards } from "@/lib/data/team-members";
import { TeamSettingsForm } from "./_components/team-settings-form";

export default async function TeamSettingsPage() {
    const { team } = await requireApprovedTeam();
    const [members, approvalDate] = await Promise.all([getTeamMembersForCards(team.id), getTeamApprovalDate(team.id)]);

    return (
        <main className="space-y-8 p-6 lg:p-10">
            <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-orange-600">Team settings</h1>
                <p className="mt-2 text-muted-foreground">Manage your team profile and member profile images.</p>
                <p className="mt-2 text-sm font-medium text-green-700">
                    Approved at
                    {approvalDate
                        ? ` ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(approvalDate))}`
                        : ""}
                </p>
            </div>
            <TeamSettingsForm members={members} team={{ displayName: team.displayName, imageUrl: team.imageUrl }} />
        </main>
    );
}
