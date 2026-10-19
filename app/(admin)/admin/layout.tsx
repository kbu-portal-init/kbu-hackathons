import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUserRole, requireAdmin } from "@/lib/auth/guards";
import { getLocale } from "@/lib/i18n/server";
import { getLineContact } from "@/lib/public-data/line-contact";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    const session = await requireAdmin();
    const locale = await getLocale();

    return (
        <DashboardSidebar
            area="admin"
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
