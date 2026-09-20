export const dynamic = "force-dynamic";

// because eventSettings is database-driven.
// If /register is statically generated, the page may contain the old value until revalidation/rebuild.

import { getEventSettings } from "@/lib/data/event-settings";
import { RegistrationForm } from "./_components/registration-form";

export default async function TeamRegistrationPage() {
    const settings = await getEventSettings();

    return (
        <main className="flex-1 bg-orange-50/60 dark:bg-orange-950/10">
            <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8 lg:py-28">
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Join the community</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Register your team</h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                    Fill out the form below to register your team for the hackathon. Once all members verify their
                    emails, your team will be automatically approved.
                </p>
                <div className="mt-12">
                    <RegistrationForm
                        minTeamSize={settings?.minTeamSize ?? 2}
                        maxTeamSize={settings?.maxTeamSize ?? 5}
                    />
                </div>
            </section>
        </main>
    );
}
