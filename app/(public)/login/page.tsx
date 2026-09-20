import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { redirectHomeIfAlreadyAuthenticated } from "@/lib/auth/guards";

const loginOptions = [
    {
        href: "/login/participant",
        icon: Users,
        label: "Participant",
        description: "Access your approved team workspace, event details, and submissions.",
    },
    {
        href: "/login/management",
        icon: ShieldCheck,
        label: "Management",
        description: "Manage events, team registrations, announcements, and platform operations.",
    },
] as const;

export default async function LoginChoicePage() {
    await redirectHomeIfAlreadyAuthenticated();
    return (
        <main className="flex flex-1 items-center bg-orange-50/60 px-6 py-16">
            <section className="mx-auto w-full max-w-4xl">
                <p className="text-center text-sm font-semibold uppercase tracking-widest text-orange-600">
                    KBU Hub access
                </p>
                <h1 className="mt-3 text-center text-4xl font-black tracking-tight sm:text-5xl">
                    Choose how you want to sign in
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-center text-zinc-600">
                    Select the workspace that matches your role.
                </p>
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {loginOptions.map(({ href, icon: Icon, label, description }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group rounded-2xl border border-orange-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100"
                        >
                            <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                <Icon className="size-6" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold">{label} login</h2>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
                            <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                                Continue{" "}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
                <Link
                    href="/"
                    className="mx-auto mt-8 block w-fit text-sm font-medium text-zinc-600 hover:text-orange-600"
                >
                    Back to KBU Hub
                </Link>
            </section>
        </main>
    );
}
