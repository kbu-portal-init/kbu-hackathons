import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
        </div>
    );
}
