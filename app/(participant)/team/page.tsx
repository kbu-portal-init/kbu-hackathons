import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamMembersForCards } from "@/lib/data/team-members";
import { MemberCards } from "./_components/member-cards";

export default async function TeamsPage() {
    const { team } = await requireApprovedTeam();

    const members = await getTeamMembersForCards(team.id);

    return (
        <main className="space-y-8 p-6 lg:p-10">
            <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-orange-600">{team.displayName}</h1>
                <p className="mt-2 text-zinc-600">Generate and share a branded digital card for each team member.</p>
            </div>
            <MemberCards members={members} />
        </main>
    );
}
