import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/server";

export default async function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
    const locale = await getLocale();
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader locale={locale} />
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
        </div>
    );
}
