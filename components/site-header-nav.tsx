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
        <div className="hidden items-center gap-10 md:flex">
            <nav className="hidden items-center gap-7 md:flex" aria-label={t.primaryNavigation}>
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
                            ? "inline-flex rounded-full bg-orange-700 px-4 py-2 text-sm font-semibold text-white ring-2 ring-orange-200"
                            : "inline-flex rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
                    }
                >
                    {t.signIn}
                </Link>
                <LanguageSwitcher locale={locale} />
            </div>
        </div>
    );
}
