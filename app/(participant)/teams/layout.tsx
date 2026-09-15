import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { getUserRole } from "@/types/auth";

export default async function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireApprovedTeam();
    return (
        <DashboardSidebar area="participant" role={getUserRole(session.user.role)}>
            {children}
        </DashboardSidebar>
    );
}
