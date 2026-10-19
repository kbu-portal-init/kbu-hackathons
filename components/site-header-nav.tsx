"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { isActivePath, publicLinks } from "@/lib/navigation";

export function SiteHeaderNav({ locale }: { locale: Locale }) {
    const pathname = usePathname();
    const t = getMessages(locale).common;
    const labels = { "/register": t.register, "/announcements": t.announcements, "/resources": t.resources };
    const signInActive = isActivePath(pathname, "/login");

    return (
        <div className="hidden items-center gap-10 lg:flex">
            <nav className="hidden items-center gap-7 lg:flex" aria-label={t.primaryNavigation}>
                {publicLinks.map(({ label, href }) => {
                    const active = isActivePath(pathname, href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={
                                active
                                    ? "font-display text-sm font-semibold text-primary"
                                    : "font-display text-sm font-medium text-muted-foreground hover:text-primary"
                            }
                        >
                            {labels[href as keyof typeof labels] ?? label}
                        </Link>
                    );
                })}
            </nav>
            <div className="flex items-center gap-2">
                <Link
                    href="/login"
                    aria-current={signInActive ? "page" : undefined}
                    className={
                        signInActive
                            ? "inline-flex min-h-10 items-center border-2 border-border bg-accent px-4 py-2 font-display text-sm font-semibold text-accent-foreground"
                            : "inline-flex min-h-10 items-center border-2 border-primary bg-primary px-4 py-2 font-display text-sm font-semibold text-foreground transition-colors hover:border-border hover:bg-foreground hover:text-background"
                    }
                >
                    {t.signIn}
                </Link>
                <LanguageSwitcher locale={locale} />
            </div>
        </div>
    );
}
