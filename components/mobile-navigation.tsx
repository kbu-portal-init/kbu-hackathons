"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { publicLinks } from "@/lib/navigation";

export function MobileNavigation() {
    const [open, setOpen] = useState(false);

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
                className="flex size-10 items-center justify-center rounded-lg text-foreground transition hover:bg-white/5"
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
                    className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-background px-6 py-6"
                    aria-label="Mobile navigation"
                >
                    <div className="flex flex-col gap-2">
                        {publicLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className="rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-auto border-t border-white/10 pt-6">
                        <Link
                            href="/login"
                            onClick={() => setOpen(false)}
                            className="block rounded-full bg-gradient-accent px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                            Login
                        </Link>
                    </div>
                </nav>
            ) : null}
        </>
    );
}
