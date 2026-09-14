import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <DashboardSidebar area="participant">{children}</DashboardSidebar>;
}
