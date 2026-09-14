import { Menu } from "lucide-react";
import Link from "next/link";

import { publicLinks } from "@/lib/navigation";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-orange-100/80 bg-white/95 backdrop-blur dark:border-orange-950/50 dark:bg-zinc-950/95">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-orange-600 text-lg font-black text-white">
                        K
                    </span>
                    <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">KBU Hub</span>
                </Link>
                <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
                    {publicLinks.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className="text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-400"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <Link
                    href="/login"
                    className="hidden rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 md:inline-flex"
                >
                    Login
                </Link>
                <details className="relative md:hidden">
                    <summary
                        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg text-zinc-700 hover:bg-orange-50 dark:text-zinc-200 dark:hover:bg-orange-950/40"
                        aria-label="Open menu"
                    >
                        <Menu className="size-6" />
                    </summary>
                    <div className="absolute right-0 top-12 w-72 rounded-xl border border-orange-100 bg-white p-4 shadow-xl dark:border-orange-950/50 dark:bg-zinc-950">
                        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                            {publicLinks.map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="rounded-lg px-3 py-3 text-base font-medium text-zinc-700 hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-200 dark:hover:bg-orange-950/40 dark:hover:text-orange-300"
                                >
                                    {label}
                                </Link>
                            ))}
                            <div className="mt-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                <Link
                                    href="/login"
                                    className="block rounded-full bg-orange-600 px-4 py-3 text-center text-sm font-semibold text-white"
                                >
                                    Login
                                </Link>
                            </div>
                        </nav>
                    </div>
                </details>
            </div>
        </header>
    );
}
