"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const options = [
    { locale: "en" as const, shortLabel: "EN", label: "English" },
    { locale: "th" as const, shortLabel: "TH", label: "ไทย" },
];

export function LanguageSwitcher({ locale, className }: { locale: Locale; className?: string }) {
    const router = useRouter();
    const t = getMessages(locale);
    const [isPending, startTransition] = useTransition();

    function changeLocale(nextLocale: Locale) {
        if (nextLocale === locale) return;

        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every supported browser.
        document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
        startTransition(() => router.refresh());
    }

    return (
        <fieldset
            className={`m-0 inline-flex min-w-0 border-2 border-brand-ink bg-transparent p-0.5 ${className ?? ""}`}
        >
            <legend className="sr-only">{t.common.language}</legend>
            {options.map((option) => {
                const active = option.locale === locale;

                return (
                    <button
                        key={option.locale}
                        type="button"
                        aria-pressed={active}
                        aria-label={option.label}
                        disabled={isPending}
                        onClick={() => changeLocale(option.locale)}
                        className={`min-h-9 flex-1 cursor-pointer px-2.5 font-display text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 ${
                            active
                                ? "bg-brand-ink text-brand-paper"
                                : "text-brand-muted-foreground hover:bg-brand-yellow hover:text-brand-ink"
                        }`}
                    >
                        {option.shortLabel}
                    </button>
                );
            })}
        </fieldset>
    );
}
