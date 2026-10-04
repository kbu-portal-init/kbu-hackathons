import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";

export default async function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireOrganizerOrAdmin();

    return (
        <DashboardSidebar
            area="management"
            role={getUserRole(session.user.role)}
            account={{
                name: session.user.name,
                email: session.user.email,
                identifier: session.user.email,
                image: session.user.image ?? null,
                role: session.user.role === "admin" ? "admin" : "organizer",
            }}
        >
            <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
