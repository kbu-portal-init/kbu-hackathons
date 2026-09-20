import Link from "next/link";

import { MobileNavigation } from "@/components/mobile-navigation";
import { publicLinks } from "@/lib/navigation";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-accent text-lg font-black text-white">
                        K
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground">KBU Hub</span>
                </Link>
                <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
                    {publicLinks.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <Link
                    href="/login"
                    className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-violet-500/50 md:inline-flex"
                >
                    Login
                </Link>
                <div className="md:hidden">
                    <MobileNavigation />
                </div>
            </div>
        </header>
    );
}
