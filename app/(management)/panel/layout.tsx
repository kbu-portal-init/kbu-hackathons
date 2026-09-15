import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { auth } from "@/lib/auth";

export default async function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Only allow organizer or admin
    if (!session?.user || (session.user.role !== "organizer" && session.user.role !== "admin")) {
        redirect("/login");
    }

    return <DashboardSidebar area="management">{children}</DashboardSidebar>;
}
