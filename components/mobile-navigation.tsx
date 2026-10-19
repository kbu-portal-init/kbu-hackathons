"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { isActivePath, publicLinks } from "@/lib/navigation";

export function MobileNavigation({ locale }: { locale: Locale }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const t = getMessages(locale).common;
    const labels = { "/register": t.register, "/announcements": t.announcements, "/resources": t.resources };

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") return;
            setOpen(false);
            toggleRef.current?.focus();
        }

        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    return (
        <>
            <button
                ref={toggleRef}
                type="button"
                className="flex size-11 items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                aria-controls="mobile-navigation"
                aria-expanded={open}
                aria-label={open ? t.closeMenu : t.openMenu}
                onClick={() => setOpen((isOpen) => !isOpen)}
            >
                {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
            {open ? (
                <nav
                    id="mobile-navigation"
                    className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t-2 border-border/10 bg-background px-5 py-5"
                    aria-label={t.mobileNavigation}
                >
                    <div className="flex flex-col">
                        {publicLinks.map(({ label, href }) => {
                            const active = isActivePath(pathname, href);
                            const linkClassName = active
                                ? "border-b-2 border-border/15 bg-accent px-4 py-3.5 font-display text-base font-semibold text-accent-foreground"
                                : "border-b-2 border-border/15 px-4 py-3.5 font-display text-base font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground";
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setOpen(false)}
                                    aria-current={active ? "page" : undefined}
                                    className={linkClassName}
                                >
                                    {labels[href as keyof typeof labels] ?? label}
                                </Link>
                            );
                        })}
                        <div className="mt-5 border-t-2 border-border/10 pt-4">
                            <p className="px-4 pb-2.5 font-display text-xs font-semibold text-muted-foreground">
                                {t.language}
                            </p>
                            <LanguageSwitcher locale={locale} className="w-full" />
                        </div>
                    </div>
                    <div className="mt-auto border-t-2 border-border/10 pt-6">
                        <Link
                            href="/login"
                            onClick={() => setOpen(false)}
                            aria-current={isActivePath(pathname, "/login") ? "page" : undefined}
                            className="flex min-h-12 items-center justify-center border-2 border-primary bg-primary px-4 py-3 text-center font-display text-sm font-semibold text-foreground"
                        >
                            {t.signIn}
                        </Link>
                    </div>
                </nav>
            ) : null}
        </>
    );
}
