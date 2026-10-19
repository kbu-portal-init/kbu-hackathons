import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { publicLinks } from "@/lib/navigation";

export async function SiteFooter() {
    const t = getMessages(await getLocale());
    const labels = {
        "/register": t.common.register,
        "/announcements": t.common.announcements,
        "/resources": t.common.resources,
    } as Record<string, string>;

    return (
        <footer className="border-t-2 border-border/10 bg-background text-muted-foreground">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <Image src="/images/logo-trans.svg" alt="" width={36} height={36} className="size-9" />
                        <p className="font-display text-lg font-semibold text-foreground">KBU Hackathon 2026</p>
                    </div>
                    <p className="mt-3 max-w-sm text-sm leading-6">{t.footer.description}</p>
                </div>

                <div>
                    <p className="font-display text-sm font-semibold text-foreground">{t.common.explore}</p>
                    <div className="mt-3 flex flex-col gap-2.5 text-sm">
                        {publicLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="w-fit hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                {labels[href] ?? label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="w-fit hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {t.common.signIn}
                        </Link>
                    </div>
                </div>

                <div>
                    <p className="font-display text-sm font-semibold text-foreground">{t.common.help}</p>
                    <div className="mt-3 flex flex-col gap-2.5 text-sm">
                        <Link
                            href="/#need-help"
                            className="w-fit hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {t.footer.helpLink}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t-2 border-border/10 px-5 py-5 text-center text-xs text-muted-foreground sm:px-8">
                Copyright {new Date().getFullYear()} KBU Hackathon 2026. Kasem Bundit University (Romklao Campus).
            </div>
        </footer>
    );
}
