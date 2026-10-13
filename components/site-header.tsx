import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SiteHeaderNav } from "@/components/site-header-nav";
import type { Locale } from "@/lib/i18n/config";

export function SiteHeader({ locale }: { locale: Locale }) {
    return (
        <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/images/logo.svg" alt="" width={36} height={36} className="size-9" />
                    <span className="text-lg font-bold tracking-tight text-foreground">KBU Hackathon 2026</span>
                </Link>
                <SiteHeaderNav locale={locale} />
                <div className="hidden md:block">
                    <LanguageSwitcher locale={locale} />
                </div>
                <div className="md:hidden">
                    <MobileNavigation locale={locale} />
                </div>
            </div>
        </header>
    );
}
