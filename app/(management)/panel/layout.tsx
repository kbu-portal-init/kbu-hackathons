import type { ReactNode } from "react";
import { getUserRole, requireOrganizerOrAdmin } from "@/actions/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireOrganizerOrAdmin();

    return (
        <DashboardSidebar area="management" role={getUserRole(session.user.role)}>
            {children}
        </DashboardSidebar>
    );
}
