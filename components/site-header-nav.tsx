"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, publicLinks } from "@/lib/navigation";

export function SiteHeaderNav() {
    const pathname = usePathname();
    const signInActive = isActivePath(pathname, "/login");

    return (
        <>
            <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
                {publicLinks.map(({ label, href }) => {
                    const active = isActivePath(pathname, href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={
                                active
                                    ? "text-sm font-semibold text-orange-700"
                                    : "text-sm font-medium text-brand-muted-foreground hover:text-orange-600"
                            }
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
            <Link
                href="/login"
                aria-current={signInActive ? "page" : undefined}
                className={
                    signInActive
                        ? "hidden rounded-full bg-orange-700 px-4 py-2 text-sm font-semibold text-white ring-2 ring-orange-200 md:inline-flex"
                        : "hidden rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white md:inline-flex"
                }
            >
                Sign in
            </Link>
        </>
    );
}
