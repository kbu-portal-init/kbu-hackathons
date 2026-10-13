import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventSettings } from "@/lib/data/event-settings";
import { countApprovedTeams } from "@/lib/data/registrations";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { type ProgramSlot, RegistrationForm } from "./_components/registration-form";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

// because eventSettings is database-driven.
// If /register is statically generated, the page may contain the old value until revalidation/rebuild.

function RegistrationFallback() {
    return (
        <div className="mt-8 rounded-2xl border border-border/10 bg-secondary p-8 shadow-xl shadow-secondary/40">
            <Skeleton className="h-6 w-64 max-w-full bg-secondary" />
            <Skeleton className="mt-4 h-4 w-full bg-zinc-100" />
            <Skeleton className="mt-3 h-4 w-5/6 bg-zinc-100" />
            <div className="mt-8 space-y-4">
                {(["one", "two", "three"] as const).map((row) => (
                    <Skeleton className="h-11 w-full bg-zinc-100" key={row} />
                ))}
            </div>
        </div>
    );
}

async function RegistrationContent({ locale }: { locale: "en" | "th" }) {
    const t = getMessages(locale).register;
    const settings = await getEventSettings();

    const now = Date.now();
    const registrationOpen =
        settings !== null &&
        now >= new Date(settings.registrationOpensAt).getTime() &&
        now <= new Date(settings.registrationClosesAt).getTime();
    const registrationNotStarted = settings !== null && now < new Date(settings.registrationOpensAt).getTime();
    const registrationUnavailable = settings === null;

    if (!registrationOpen) {
        return (
            <div className="mt-8 rounded-2xl border border-border/10 bg-secondary p-8 shadow-xl shadow-secondary/40">
                <h2 className="text-xl font-semibold">
                    {registrationUnavailable ? t.unavailable : registrationNotStarted ? t.notOpened : t.closed}
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                    {registrationUnavailable
                        ? t.unavailableText
                        : registrationNotStarted
                          ? `${t.notOpenedText} ${dateFormatter.format(new Date(settings.registrationOpensAt))}. ${t.returnDuring}`
                          : t.closedText}
                </p>
            </div>
        );
    }

    const [thaiApproved, internationalApproved] = await Promise.all([
        countApprovedTeams("THAI_PROGRAM"),
        countApprovedTeams("INTERNATIONAL_PROGRAM"),
    ]);

    const programSlots: ProgramSlot[] = [
        {
            program: "THAI_PROGRAM",
            remaining: Math.max(0, settings.maxThaiTeams - thaiApproved),
            limit: settings.maxThaiTeams,
        },
        {
            program: "INTERNATIONAL_PROGRAM",
            remaining: Math.max(0, settings.maxInternationalTeams - internationalApproved),
            limit: settings.maxInternationalTeams,
        },
    ];

    if (programSlots.every((slot) => slot.remaining === 0)) {
        return (
            <div className="mt-8 rounded-2xl border border-border/10 bg-secondary p-8 shadow-xl shadow-secondary/40">
                <h2 className="text-xl font-semibold">{t.allFilled}</h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{t.allFilledText}</p>
            </div>
        );
    }

    return (
        <>
            <p className="mt-6 max-w-2xl text-left text-lg leading-8 text-brand-muted-foreground">{t.formIntro}</p>
            <div className="mt-6">
                <RegistrationForm
                    minTeamSize={settings.minTeamSize}
                    maxTeamSize={settings.maxTeamSize}
                    programSlots={programSlots}
                    locale={locale}
                />
            </div>
        </>
    );
}

export default async function TeamRegistrationPage() {
    const locale = await getLocale();
    const t = getMessages(locale).register;
    return (
        <main className="flex-1 bg-secondary/60">
            <section className="mx-auto max-w-3xl px-6 py-12 text-left lg:px-8 lg:py-20">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t.join}</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
                <p className="mt-4 leading-6 text-brand-muted-foreground">
                    {t.learnMore}{" "}
                    <Link
                        className="font-semibold text-primary underline underline-offset-4"
                        href="/#everything-you-need-to-know"
                    >
                        {t.learnMoreLink}
                    </Link>{" "}
                    {t.beforeRegistering}
                </p>
                <Suspense fallback={<RegistrationFallback />}>
                    <RegistrationContent locale={locale} />
                </Suspense>
            </section>
        </main>
    );
}
