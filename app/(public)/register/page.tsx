import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventSettings } from "@/lib/data/event-settings";
import { countApprovedTeams } from "@/lib/data/registrations";
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
        <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/40">
            <Skeleton className="h-6 w-64 max-w-full bg-orange-100" />
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

async function RegistrationContent() {
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
            <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/40">
                <h2 className="text-xl font-semibold">
                    {registrationUnavailable
                        ? "Registration is unavailable"
                        : registrationNotStarted
                          ? "Registration has not opened yet"
                          : "Registration is closed"}
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                    {registrationUnavailable
                        ? "Registration details are not available right now. Please try again later."
                        : registrationNotStarted
                          ? `Registration has not started yet. It opens on ${dateFormatter.format(new Date(settings.registrationOpensAt))}. Please return during the registration period to submit your team.`
                          : "The registration period has ended. Please contact the organizers if you have any questions."}
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
            <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/40">
                <h2 className="text-xl font-semibold">All team slots are filled</h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                    Both programs have reached their team limits. Please contact the organizers if you have any
                    questions.
                </p>
            </div>
        );
    }

    return (
        <>
            <p className="mt-6 max-w-2xl text-left text-lg leading-8 text-brand-muted-foreground">
                Fill out the form below to register your team for the hackathon.
            </p>
            <div className="mt-6">
                <RegistrationForm
                    minTeamSize={settings.minTeamSize}
                    maxTeamSize={settings.maxTeamSize}
                    programSlots={programSlots}
                />
            </div>
        </>
    );
}

export default function TeamRegistrationPage() {
    return (
        <main className="flex-1 bg-orange-50/60">
            <section className="mx-auto max-w-3xl px-6 py-12 text-left lg:px-8 lg:py-20">
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                    Join KBU Hackathon 2026
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Register your team</h1>
                <p className="mt-4 leading-6 text-brand-muted-foreground">
                    Not sure what the event involves? Read{" "}
                    <Link
                        className="font-semibold text-orange-600 underline underline-offset-4"
                        href="/#everything-you-need-to-know"
                    >
                        Everything you need to know
                    </Link>{" "}
                    before registering.
                </p>
                <Suspense fallback={<RegistrationFallback />}>
                    <RegistrationContent />
                </Suspense>
            </section>
        </main>
    );
}
