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
                className="flex size-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-cyan-50 dark:text-zinc-200 dark:hover:bg-cyan-950/40"
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
                    className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-white px-6 py-6 dark:bg-zinc-950"
                    aria-label="Mobile navigation"
                >
                    <div className="flex flex-col gap-2">
                        {publicLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className="rounded-xl px-4 py-3 text-base font-medium text-zinc-700 hover:bg-cyan-50 hover:text-cyan-700 dark:text-zinc-200 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-auto border-t border-cyan-100 pt-6 dark:border-cyan-950/50">
                        <Link
                            href="/login"
                            onClick={() => setOpen(false)}
                            className="block rounded-full bg-cyan-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-cyan-700"
                        >
                            Login
                        </Link>
                    </div>
                </nav>
            ) : null}
        </>
    );
}
