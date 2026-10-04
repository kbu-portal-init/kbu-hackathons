import Link from "next/link";

import { MobileNavigation } from "@/components/mobile-navigation";
import { SiteHeaderNav } from "@/components/site-header-nav";

export async function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-orange-100/80 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-accent text-lg font-black text-white">
                        K
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground">KBU Hackathon 2026</span>
                </Link>
                <SiteHeaderNav />
                <div className="md:hidden">
                    <MobileNavigation />
                </div>
            </div>
        </header>
    );
}
