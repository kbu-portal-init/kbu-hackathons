import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { getLocale } from "@/lib/i18n/server";
import { getLineContact } from "@/lib/public-data/line-contact";

export default async function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireOrganizerOrAdmin();
    const locale = await getLocale();

    return (
        <DashboardSidebar
            area="management"
            locale={locale}
            lineContact={getLineContact()}
            role={getUserRole(session.user.role)}
            account={{
                name: session.user.name,
                email: session.user.email,
                identifier: session.user.email,
                image: session.user.image ?? null,
            }}
        >
            <div className="flex-1 bg-brand-paper p-4 sm:p-6 lg:p-8">{children}</div>
        </DashboardSidebar>
    );
}
