"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { type PasswordResetInput, passwordResetSchema } from "@/lib/contracts/auth";

export function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string>();
    const [completed, setCompleted] = useState(false);
    const form = useForm<PasswordResetInput>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (values: PasswordResetInput) => {
        setSubmitError(undefined);
        if (!token) {
            setSubmitError("This password setup link is missing or invalid.");
            return;
        }

        const result = await authClient.resetPassword({
            newPassword: values.newPassword,
            token,
        });
        if (result.error) {
            setSubmitError("This password setup link is invalid or expired. Request a new link.");
            return;
        }
        setCompleted(true);
    };

    if (completed) {
        return (
            <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
                <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-7 shadow-xl dark:border-orange-950 dark:bg-zinc-900">
                    <h1 className="text-3xl font-bold tracking-tight">Password set</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        Your password has been saved. You can now sign in with your team username and new password.
                    </p>
                    <Button className="mt-6 w-full" onClick={() => router.push("/login/participant")}>
                        Go to participant login
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-300"
                >
                    <ArrowLeft className="size-4" /> Back to KBU Hackathon 2026
                </Link>
                <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                        <LockKeyhole className="size-5" />
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-orange-600">
                        Password setup
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Set your password</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        Choose a password for your KBU Hackathon 2026 account.
                    </p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <p className="text-sm text-red-500">{submitError}</p>
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium">
                                New password
                            </label>
                            <Input
                                id="newPassword"
                                type="password"
                                autoComplete="new-password"
                                {...form.register("newPassword")}
                            />
                            <FormError message={form.formState.errors.newPassword?.message} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                {...form.register("confirmPassword")}
                            />
                            <FormError message={form.formState.errors.confirmPassword?.message} />
                        </div>
                        <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving password..." : "Set password"}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}

function FormError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-red-500">{message}</p> : null;
}
