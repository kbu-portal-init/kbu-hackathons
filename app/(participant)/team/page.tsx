import { IdCard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardOverviewSkeleton } from "@/components/dashboard-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getTeamOverview } from "@/lib/data/team-overview";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { TeamOverview } from "./_components/team-overview";

export default async function TeamPage() {
    const { team, user } = await requireApprovedTeam();
    const locale = await getLocale();
    const t = getMessages(locale).teamOverview;

    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow={t.eyebrow}
                title={team.displayName}
                description={t.description}
                actions={
                    <Link className={buttonVariants({ variant: "outline" })} href="/team/cards">
                        <IdCard className="size-4" />
                        {t.memberCards}
                    </Link>
                }
            />
            <Suspense fallback={<DashboardOverviewSkeleton />}>
                <TeamOverviewContent
                    locale={locale}
                    team={{ loginName: team.loginName, program: team.program }}
                    teamId={team.id}
                    userId={user.id}
                />
            </Suspense>
        </main>
    );
}

async function TeamOverviewContent({
    locale,
    team,
    teamId,
    userId,
}: {
    locale: Locale;
    team: { loginName: string; program: "THAI_PROGRAM" | "INTERNATIONAL_PROGRAM" };
    teamId: string;
    userId: string;
}) {
    const overview = await getTeamOverview(teamId, userId);

    return <TeamOverview locale={locale} overview={overview} team={team} />;
}
