import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireApprovedTeam } from "@/lib/auth/guards";
import { getLocale } from "@/lib/i18n/server";
import { getLineContact } from "@/lib/public-data/line-contact";

export default async function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireApprovedTeam();
    const locale = await getLocale();
    return (
        <DashboardSidebar
            area="participant"
            locale={locale}
            lineContact={getLineContact()}
            role={getUserRole(session.user.role)}
            account={{
                name: session.user.name,
                email: session.user.email,
                identifier: session.user.displayUsername ?? session.user.username ?? session.user.email,
                image: session.user.image ?? null,
            }}
        >
            <div className="flex-1 space-y-8 bg-background p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
