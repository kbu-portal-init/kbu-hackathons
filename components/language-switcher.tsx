"use client";

import { cn } from "cn";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
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
        <fieldset className={`m-0 inline-flex min-w-0 border-2 border-border bg-transparent p-0.5 ${className ?? ""}`}>
            <legend className="sr-only">{t.common.language}</legend>
            {options.map((option) => {
                const active = option.locale === locale;

                return (
                    <Button
                        key={option.locale}
                        type="button"
                        variant={active ? "default" : "ghost"}
                        size="sm"
                        aria-pressed={active}
                        aria-label={option.label}
                        disabled={isPending}
                        onClick={() => changeLocale(option.locale)}
                        className={cn(
                            "min-h-9 flex-1 border-0 px-2.5",
                            !active && "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                    >
                        {option.shortLabel}
                    </Button>
                );
            })}
        </fieldset>
    );
}
