import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";

export default async function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireOrganizerOrAdmin();

    return (
        <DashboardSidebar area="management" role={getUserRole(session.user.role)}>
            <div className="flex-1 space-y-8 p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
