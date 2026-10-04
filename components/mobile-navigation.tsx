"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isActivePath, publicLinks } from "@/lib/navigation";

export function MobileNavigation() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                className="flex size-11 items-center justify-center rounded-lg text-brand-muted-foreground hover:bg-orange-50"
                aria-controls="mobile-navigation"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((isOpen) => !isOpen)}
            >
                {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
            {open ? (
                <nav
                    id="mobile-navigation"
                    className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-white px-6 py-6"
                    aria-label="Mobile navigation"
                >
                    <div className="flex flex-col gap-2">
                        {publicLinks.map(({ label, href }) => {
                            const active = isActivePath(pathname, href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setOpen(false)}
                                    aria-current={active ? "page" : undefined}
                                    className={
                                        active
                                            ? "rounded-xl bg-orange-50 px-4 py-3 text-base font-semibold text-orange-700"
                                            : "rounded-xl px-4 py-3 text-base font-medium text-brand-muted-foreground hover:bg-orange-50 hover:text-orange-700"
                                    }
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="mt-auto border-t border-orange-100 pt-6">
                        <Link
                            href="/login"
                            onClick={() => setOpen(false)}
                            aria-current={isActivePath(pathname, "/login") ? "page" : undefined}
                            className="block rounded-full bg-gradient-accent px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                            Sign in
                        </Link>
                    </div>
                </nav>
            ) : null}
        </>
    );
}
