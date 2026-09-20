import { headers } from "next/headers";
import Link from "next/link";

import { MobileNavigation } from "@/components/mobile-navigation";
import { auth } from "@/lib/auth/config";
import { getUserRole } from "@/lib/auth/guards";
import { publicLinks } from "@/lib/navigation";

/** Where an authenticated user lands, and what the button reads, by role. */
const consoleEntry = {
    team: { href: "/teams", label: "Go to Console" },
    organizer: { href: "/panel", label: "Go to Panel" },
    admin: { href: "/admin", label: "Go to Console" },
} as const;

export async function SiteHeader() {
    const session = await auth.api.getSession({ headers: await headers() });
    const role = getUserRole(session?.user?.role);
    const cta = role ? consoleEntry[role] : { href: "/login", label: "Login" };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-background/80 backdrop-blur-lg">
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
                {/* Authenticated users go to their console; guests go to login. */}
                <div className="hidden items-center gap-4 md:flex">
                    <Link
                        href={cta.href}
                        className="rounded-md bg-gradient-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-gradient-accent/80"
                    >
                        {cta.label}
                    </Link>
                </div>
                <div className="md:hidden">
                    <MobileNavigation />
                </div>
            </div>
        </header>
    );
}
