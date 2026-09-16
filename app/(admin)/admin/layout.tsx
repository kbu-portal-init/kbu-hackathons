import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireAdmin } from "@/lib/auth/guards";
import { getUserRole } from "@/types/auth";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireAdmin();

    return (
        <DashboardSidebar area="admin" role={getUserRole(session.user.role)}>
            {children}
        </DashboardSidebar>
    );
}
