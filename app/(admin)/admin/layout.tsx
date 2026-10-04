import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireAdmin();

    return (
        <DashboardSidebar
            area="admin"
            role={getUserRole(session.user.role)}
            account={{
                name: session.user.name,
                email: session.user.email,
                identifier: session.user.email,
                image: session.user.image ?? null,
            }}
        >
            <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
