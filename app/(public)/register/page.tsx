import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventSettings } from "@/lib/data/event-settings";
import { countApprovedTeams } from "@/lib/data/registrations";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { RegistrationForm } from "./_components/registration-form";
import type { ProgramSlot } from "./_components/types";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
});

// because eventSettings is database-driven.
// If /register is statically generated, the page may contain the old value until revalidation/rebuild.

function StatusCard({ title, text }: { title: string; text: string }) {
    return (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{text}</p>
        </div>
    );
}

function RegistrationFallback() {
    return (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="space-y-6">
                {(["team", "leader", "members"] as const).map((section) => (
                    <div className="rounded-2xl border border-border/60 bg-card p-6" key={section}>
                        <Skeleton className="h-6 w-56 max-w-full" />
                        <Skeleton className="mt-6 h-11 w-full" />
                        <Skeleton className="mt-4 h-11 w-full" />
                    </div>
                ))}
            </div>
            <Skeleton className="hidden h-72 rounded-2xl lg:block" />
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
            <StatusCard
                title={registrationUnavailable ? t.unavailable : registrationNotStarted ? t.notOpened : t.closed}
                text={
                    registrationUnavailable
                        ? t.unavailableText
                        : registrationNotStarted
                          ? `${t.notOpenedText} ${dateFormatter.format(new Date(settings.registrationOpensAt))}. ${t.returnDuring}`
                          : t.closedText
                }
            />
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
        return <StatusCard title={t.allFilled} text={t.allFilledText} />;
    }

    return (
        <>
            <p className="mt-4 max-w-2xl text-left text-lg leading-8 text-brand-muted-foreground">{t.formIntro}</p>
            <div className="mt-8">
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
            <section className="mx-auto max-w-5xl px-6 py-12 text-left lg:px-8 lg:py-16">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
                <p className="mt-4 max-w-2xl leading-6 text-brand-muted-foreground">
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
