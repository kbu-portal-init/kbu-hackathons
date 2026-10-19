import Image from "next/image";
import Link from "next/link";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SiteHeaderNav } from "@/components/site-header-nav";
import type { Locale } from "@/lib/i18n/config";

export function SiteHeader({ locale }: { locale: Locale }) {
    return (
        <header className="sticky top-0 z-50 border-b-2 border-brand-ink/10 bg-brand-paper/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image src="/images/logo.svg" alt="" width={36} height={36} className="size-9" />
                    <span className="font-display text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
                        KBU Hackathon 2026
                    </span>
                </Link>
                <SiteHeaderNav locale={locale} />
                <div className="lg:hidden">
                    <MobileNavigation locale={locale} />
                </div>
            </div>
        </header>
    );
}
