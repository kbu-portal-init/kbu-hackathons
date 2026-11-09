import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamOverview } from "@/lib/data/team-overview";
import { getLocale } from "@/lib/i18n/server";
import { TeamOverview } from "./_components/team-overview";

export default async function TeamPage() {
    const { team, user } = await requireApprovedTeam();
    const locale = await getLocale();
    const overview = await getTeamOverview(team.id, user.id);

    return (
        <main className="space-y-8">
            <TeamOverview
                overview={overview}
                team={{ loginName: team.loginName, program: team.program }}
                locale={locale}
            />
        </main>
    );
}
