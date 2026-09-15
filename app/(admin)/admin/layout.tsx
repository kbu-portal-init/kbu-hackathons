import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <DashboardSidebar area="admin">{children}</DashboardSidebar>;
}
