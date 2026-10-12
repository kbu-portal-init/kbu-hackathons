import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { publicLinks } from "@/lib/navigation";

export async function SiteFooter() {
    const t = getMessages(await getLocale());
    return (
        <footer className="border-t border-orange-100 bg-orange-50 text-brand-muted-foreground">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
                <div className="sm:col-span-2">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/logo.svg"
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 mix-blend-multiply"
                        />
                        <p className="text-lg font-bold text-zinc-950">KBU Hackathon 2026</p>
                    </div>
                    <p className="mt-3 max-w-sm text-sm leading-6">{t.footer.description}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-zinc-950">{t.common.explore}</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        {publicLinks.map(({ href, label }) => (
                            <Link key={href} href={href} className="hover:text-orange-700">
                                {(
                                    {
                                        "/register": t.common.register,
                                        "/announcements": t.common.announcements,
                                        "/resources": t.common.resources,
                                    } as Record<string, string>
                                )[href] ?? label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-zinc-950">{t.common.account}</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        <Link href="/login" className="hover:text-orange-700">
                            {t.common.signIn}
                        </Link>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-zinc-950">{t.common.help}</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        <Link href="/#need-help" className="hover:text-orange-700">
                            Need help?
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-orange-200 px-6 py-5 text-center text-xs text-brand-muted-foreground">
                Copyright {new Date().getFullYear()} KBU Hackathon 2026. Kasem Bundit University (Romklao Campus).
            </div>
        </footer>
    );
}
