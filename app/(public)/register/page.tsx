export const dynamic = "force-dynamic";

// because eventSettings is database-driven.
// If /register is statically generated, the page may contain the old value until revalidation/rebuild.

import { getEventSettings } from "@/lib/data/event-settings";
import { RegistrationForm } from "./_components/registration-form";

export default async function TeamRegistrationPage() {
    const settings = await getEventSettings();

    const now = Date.now();
    const registrationOpen =
        settings !== null &&
        now >= new Date(settings.registrationOpensAt).getTime() &&
        now <= new Date(settings.registrationClosesAt).getTime();
    const registrationNotStarted = settings !== null && now < new Date(settings.registrationOpensAt).getTime();
    const registrationUnavailable = settings === null;

    return (
        <main className="flex-1 bg-orange-50/60 dark:bg-orange-950/10">
            <section className="mx-auto max-w-3xl px-6 py-12 text-left lg:px-8 lg:py-20">
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                    Join KBU Hackathon 2026
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Register your team</h1>
                {registrationOpen ? (
                    <>
                        <p className="mt-6 max-w-2xl text-left text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                            Fill out the form below to register your team for the hackathon.
                        </p>
                        <div className="mt-6">
                            <RegistrationForm minTeamSize={settings.minTeamSize} maxTeamSize={settings.maxTeamSize} />
                        </div>
                    </>
                ) : (
                    <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                        <h2 className="text-xl font-semibold">
                            {registrationUnavailable
                                ? "Registration is unavailable"
                                : registrationNotStarted
                                  ? "Registration has not opened yet"
                                  : "Registration is closed"}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            {registrationUnavailable
                                ? "Registration details are not available right now. Please try again later."
                                : registrationNotStarted
                                  ? "Registration has not started yet. Please return during the registration period to submit your team."
                                  : "The registration period has ended. Please contact the organizers if you have any questions."}
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
