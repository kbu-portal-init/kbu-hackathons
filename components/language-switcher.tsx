"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const options = [
    { locale: "en" as const, label: "English", image: "/images/uk.png" },
    { locale: "th" as const, label: "ไทย", image: "/images/thai.png" },
];

export function LanguageSwitcher({ locale, className }: { locale: Locale; className?: string }) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const currentOption = options.find((option) => option.locale === locale) ?? options[0];

    useEffect(() => {
        function closeOnOutsideClick(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    function changeLocale(nextLocale: Locale) {
        if (nextLocale === locale) {
            setIsOpen(false);
            return;
        }

        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every supported browser.
        document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
        setIsOpen(false);
        startTransition(() => router.refresh());
    }

    return (
        <div ref={containerRef} className={`relative ${className ?? ""}`}>
            <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={getMessages(locale).common.language}
                disabled={isPending}
                onClick={() => setIsOpen((open) => !open)}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-secondary bg-card px-3 text-left text-sm font-semibold text-muted-foreground shadow-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-wait disabled:opacity-60 ${className ? "w-full justify-start" : ""}`}
            >
                <Image
                    src={currentOption.image}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 rounded-full object-cover"
                />
                <span>{currentOption.label}</span>
                <ChevronDown
                    aria-hidden="true"
                    className={`size-4 text-zinc-400 transition-transform ${className ? "ml-auto" : ""} ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            {isOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-full overflow-hidden rounded-lg border border-secondary bg-card p-1.5 shadow-lg shadow-primary/25">
                    {options.map((option) => {
                        const active = option.locale === locale;
                        return (
                            <button
                                key={option.locale}
                                type="button"
                                onClick={() => changeLocale(option.locale)}
                                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${active ? "bg-primary/50 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}
                            >
                                <Image
                                    src={option.image}
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="size-5 rounded-full object-cover"
                                />
                                <span className="flex-1 whitespace-nowrap">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
