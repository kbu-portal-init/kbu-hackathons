import Link from "next/link";

import { MobileNavigation } from "@/components/mobile-navigation";
import { publicLinks } from "@/lib/navigation";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-cyan-100/80 bg-white/95 backdrop-blur dark:border-cyan-950/50 dark:bg-zinc-950/95">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-600 text-lg font-black text-white">
                        K
                    </span>
                    <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">KBU Hub</span>
                </Link>
                <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
                    {publicLinks.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className="text-sm font-medium text-zinc-600 hover:text-cyan-600 dark:text-zinc-300 dark:hover:text-cyan-400"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <Link
                    href="/login"
                    className="hidden rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 md:inline-flex"
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
