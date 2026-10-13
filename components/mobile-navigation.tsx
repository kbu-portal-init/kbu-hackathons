"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { isActivePath, publicLinks } from "@/lib/navigation";

export function MobileNavigation({ locale }: { locale: Locale }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const t = getMessages(locale).common;
    const labels = { "/register": t.register, "/announcements": t.announcements, "/resources": t.resources };

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
                className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
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
                    className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-white px-6 py-6"
                    aria-label={t.mobileNavigation}
                >
                    <div className="flex flex-col gap-2">
                        {publicLinks.map(({ label, href }) => {
                            const active = isActivePath(pathname, href);
                            const linkClassName = active
                                ? "rounded-xl bg-secondary px-4 py-3 text-base font-semibold text-primary/90"
                                : "rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-primary/90";
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
                        <div className="mt-2 border-t border-zinc-200 pt-4">
                            <p className="px-4 pb-2 text-xs font-semibold text-zinc-500">{t.language}</p>
                            <LanguageSwitcher locale={locale} className="w-full" />
                        </div>
                    </div>
                    <div className="mt-auto border-t border-border/10 pt-6">
                        <Link
                            href="/login"
                            onClick={() => setOpen(false)}
                            aria-current={isActivePath(pathname, "/login") ? "page" : undefined}
                            className="block rounded-full bg-gradient-accent px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                            {t.signIn}
                        </Link>
                    </div>
                </nav>
            ) : null}
        </>
    );
}
