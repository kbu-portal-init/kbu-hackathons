import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireApprovedTeam } from "@/lib/auth/guards";

export default async function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireApprovedTeam();
    return (
        <DashboardSidebar
            area="participant"
            role={getUserRole(session.user.role)}
            account={{
                name: session.user.name,
                email: session.user.email,
                identifier: session.user.displayUsername ?? session.user.username ?? session.user.email,
                image: session.user.image ?? null,
            }}
        >
            <div className="flex-1 space-y-8 p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
