import Link from "next/link";
import { getAuthenticatedDestination } from "@/lib/auth/guards";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function HomeAuthAction({ locale }: { locale: Locale }) {
    const destination = await getAuthenticatedDestination();
    if (!destination) {
        return (
            <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-orange-600 px-5 py-3 font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0"
            >
                ./sign-in
            </Link>
        );
    }

    const label = getMessages(locale).common.openWorkspace;
    return (
        <Link
            href={destination}
            className="inline-flex items-center justify-center rounded-lg border border-orange-600 px-5 py-3 font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0"
        >
            {label}
        </Link>
    );
}
