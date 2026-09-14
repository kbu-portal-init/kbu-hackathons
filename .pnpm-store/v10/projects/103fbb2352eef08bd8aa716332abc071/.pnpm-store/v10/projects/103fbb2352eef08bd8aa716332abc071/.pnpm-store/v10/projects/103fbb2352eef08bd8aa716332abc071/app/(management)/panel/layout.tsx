import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <DashboardSidebar area="management">{children}</DashboardSidebar>;
}
