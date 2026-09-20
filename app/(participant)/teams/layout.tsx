import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireApprovedTeam } from "@/lib/auth/guards";

export default async function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireApprovedTeam();
    return (
        <DashboardSidebar area="participant" role={getUserRole(session.user.role)}>
            {children}
        </DashboardSidebar>
    );
}
