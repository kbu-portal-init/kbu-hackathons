"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

const options = [
    { locale: "en" as const, label: "English", image: "/images/uk.png" },
    { locale: "th" as const, label: "ไทย", image: "/images/thai.png" },
];

export function LanguageSwitcher({ locale }: { locale: Locale }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function changeLocale(nextLocale: Locale) {
        if (nextLocale === locale) return;
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every supported browser.
        document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
        startTransition(() => router.refresh());
    }

    return (
        <fieldset className="flex items-center gap-1 rounded-full border border-orange-100 bg-white p-1">
            <legend className="sr-only">Language</legend>
            {options.map((option) => {
                const active = option.locale === locale;
                return (
                    <button
                        key={option.locale}
                        type="button"
                        aria-pressed={active}
                        aria-label={`Use ${option.label}`}
                        disabled={isPending}
                        onClick={() => changeLocale(option.locale)}
                        className={`cursor-pointer inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${active ? "bg-orange-600 text-white" : "text-zinc-600 hover:bg-orange-50"}`}
                    >
                        <Image src={option.image} alt="" width={20} height={14} className="h-3.5 w-5 object-cover" />
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </fieldset>
    );
}
