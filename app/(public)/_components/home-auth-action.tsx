import Link from "next/link";
import { getAuthenticatedDestination } from "@/lib/auth/guards";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function HomeAuthAction({ locale }: { locale: Locale }) {
    const t = getMessages(locale).common;
    const destination = await getAuthenticatedDestination();

    return (
        <Link
            href={destination ?? "/login"}
            className="inline-flex min-h-12 items-center justify-center border-2 border-border px-6 py-3 font-display text-base font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
            {destination ? t.openWorkspace : t.signIn}
        </Link>
    );
}
