"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { loginAsStaff, loginAsTeam } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Loader from "../../../../components/loader";

type LoginPageProps = {
    audience: "participant" | "management";
    title: string;
    description: string;
};

export function LoginContent({ audience, title, description }: LoginPageProps) {
    const router = useRouter();
    const { isPending } = authClient.useSession();
    const isParticipant = audience === "participant";

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            const callbacks = {
                onSuccess: () => {
                    router.push(isParticipant ? "/teams" : "/panel");
                    toast.success("Sign in successful");
                },
                onError: (error: { error: { message?: string; statusText?: string } }) => {
                    toast.error(error.error.message || error.error.statusText);
                },
            };
            const result = isParticipant
                ? await loginAsTeam({ username: value.email, password: value.password }, callbacks)
                : await loginAsStaff({ email: value.email, password: value.password }, callbacks);
            if (result?.error) {
                toast.error(typeof result.error === "string" ? result.error : result.error.message);
            }
        },
        validators: {
            onSubmit: z.object({
                email: z.string().min(1, isParticipant ? "Team name is required" : "Email is required"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    if (isPending) {
        return <Loader />;
    }

    const identifier = isParticipant
        ? {
              label: "TeamName",
              name: "team",
              type: "text" as const,
              autoComplete: "username",
              placeholder: "Enter your teamname we provided you",
          }
        : {
              label: "Email address",
              name: "email",
              type: "email" as const,
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

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="mt-8 space-y-5"
                    >
                        {/* Identifier field (Email for management) */}
                        <form.Field name="email">
                            {(field) => (
                                <div className="space-y-2">
                                    <label htmlFor={field.name} className="text-sm font-medium">
                                        {identifier.label}
                                    </label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type={identifier.type}
                                        autoComplete={identifier.autoComplete}
                                        placeholder={identifier.placeholder}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        required
                                    />
                                    {field.state.meta.errors.map((error) => (
                                        <p key={error?.message} className="text-sm text-red-500">
                                            {error?.message}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </form.Field>

                        {/* Password field */}
                        <form.Field name="password">
                            {(field) => (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor={field.name} className="text-sm font-medium">
                                            Password
                                        </label>
                                        <span className="text-xs text-zinc-500">Forgot password?</span>
                                    </div>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        required
                                    />
                                    {field.state.meta.errors.map((error) => (
                                        <p key={error?.message} className="text-sm text-red-500">
                                            {error?.message}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </form.Field>

                        <form.Subscribe
                            selector={(state) => ({
                                canSubmit: state.canSubmit,
                                isSubmitting: state.isSubmitting,
                            })}
                        >
                            {({ canSubmit, isSubmitting }) => (
                                <Button type="submit" className="h-10 w-full" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? "Signing in..." : "Sign in"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </form>
                </div>
            </div>
        </main>
    );
}
