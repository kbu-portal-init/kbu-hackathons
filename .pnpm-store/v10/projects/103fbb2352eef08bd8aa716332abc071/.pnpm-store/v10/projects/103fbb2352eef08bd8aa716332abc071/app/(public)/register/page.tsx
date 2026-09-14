import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const steps = [
    "Choose a hackathon event and review its requirements.",
    "Prepare your team details and registration information.",
    "Wait for the organizers to review and approve your team.",
];

export default function TeamRegistrationPage() {
    return (
        <main className="flex-1 bg-orange-50/60 dark:bg-orange-950/10">
            <section className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-8 lg:py-28">
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Join the community</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Register your team</h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                    Team registration will open when an event is announced. Once your registration is reviewed and
                    approved, your team will receive access to its participant dashboard.
                </p>
                <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-orange-100 bg-white p-7 text-left shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                    <h2 className="text-xl font-bold">How it works</h2>
                    <div className="mt-6 space-y-5">
                        {steps.map((step, index) => (
                            <div key={step} className="flex gap-4">
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-orange-600" />
                                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                    <span className="font-semibold text-zinc-950 dark:text-white">
                                        Step {index + 1}.{" "}
                                    </span>
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
                    >
                        Explore events <ArrowRight className="size-4" />
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-orange-700 dark:border-orange-900 dark:bg-zinc-950 dark:text-orange-300"
                    >
                        Login
                    </Link>
                </div>
            </section>
        </main>
    );
}
