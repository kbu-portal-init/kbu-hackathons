import type { ReactNode } from "react";
import { getUserRole, requireAdmin } from "@/actions/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireAdmin();

    return (
        <DashboardSidebar area="admin" role={getUserRole(session.user.role)}>
            {children}
        </DashboardSidebar>
    );
}
