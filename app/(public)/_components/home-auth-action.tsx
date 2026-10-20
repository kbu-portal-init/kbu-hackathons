import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getAuthenticatedDestination } from "@/lib/auth/guards";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function HomeAuthAction({ locale }: { locale: Locale }) {
    const t = getMessages(locale).common;
    const destination = await getAuthenticatedDestination();

    return (
        <Link href={destination ?? "/login"} className={buttonVariants({ variant: "outline", size: "lg" })}>
            {destination ? t.openWorkspace : t.signIn}
        </Link>
    );
}
