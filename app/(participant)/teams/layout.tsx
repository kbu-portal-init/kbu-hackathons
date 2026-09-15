import type { ReactNode } from "react";
import { requireAuth } from "@/actions/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole } from "@/types/auth";

export default async function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireAuth();
    return (
        <DashboardSidebar area="participant" role={getUserRole(session.user.role)}>
            {children}
        </DashboardSidebar>
    );
}
