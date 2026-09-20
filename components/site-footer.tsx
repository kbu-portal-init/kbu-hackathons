import Link from "next/link";
import { publicLinks } from "@/lib/navigation";

export function SiteFooter() {
    return (
        <footer className="border-t border-slate-200 bg-secondary/40 text-muted-foreground">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                <div className="sm:col-span-2">
                    <p className="text-lg font-bold text-foreground">KBU Hub</p>
                    <p className="mt-3 max-w-sm text-sm leading-6">
                        Your home for hackathon events, announcements, resources, and the teams building what comes
                        next.
                    </p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Explore</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        {publicLinks.map(({ href, label }) => (
                            <Link key={href} href={href} className="transition hover:text-cyan-700">
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Account</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        <Link href="/login" className="transition hover:text-cyan-700">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-5 text-center text-xs">
                Copyright {new Date().getFullYear()} KBU Hub. Built for the next big idea.
            </div>
        </footer>
    );
}
