import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireAdmin();

    return (
        <DashboardSidebar area="admin" role={getUserRole(session.user.role)}>
            <div className="flex-1 space-y-8 p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
