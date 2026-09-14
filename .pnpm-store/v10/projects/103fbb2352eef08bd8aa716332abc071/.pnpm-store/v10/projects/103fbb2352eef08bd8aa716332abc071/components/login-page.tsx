import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginPageProps = {
    audience: "participant" | "management";
    title: string;
    description: string;
};

export function LoginPage({ audience, title, description }: LoginPageProps) {
    const isParticipant = audience === "participant";
    const identifier = isParticipant
        ? {
              label: "TeamName",
              name: "team",
              type: "text",
              autoComplete: "username",
              placeholder: "Enter your teamname we provided you",
          }
        : {
              label: "Email address",
              name: "email",
              type: "email",
              autoComplete: "email",
              placeholder: "you@example.com",
          };
    return (
        <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-300"
                >
                    <ArrowLeft className="size-4" /> Back to KBU Hub
                </Link>
                <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                        <LockKeyhole className="size-5" />
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-orange-600">
                        {isParticipant ? "Participant access" : "Management access"}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
                    <form className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <label htmlFor={identifier.name} className="text-sm font-medium">
                                {identifier.label}
                            </label>
                            <Input
                                id={identifier.name}
                                name={identifier.name}
                                type={identifier.type}
                                autoComplete={identifier.autoComplete}
                                placeholder={identifier.placeholder}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <span className="text-xs text-zinc-500">Forgot password?</span>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <Button type="submit" className="h-10 w-full">
                            Sign in
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-xs text-zinc-500">
                        Demo page only. Authentication will be connected later.
                    </p>
                </div>
            </div>
        </main>
    );
}
