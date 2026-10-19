"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BackButton } from "@/components/back-button";
import { PosterButton } from "@/components/poster";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { authClient } from "@/lib/auth-client";
import { type PasswordResetInput, passwordResetSchema } from "@/lib/contracts/auth";

export function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string>();
    const [completed, setCompleted] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            <main className="flex flex-1 items-center justify-center bg-background px-5 py-16 sm:px-8">
                <div className="w-full max-w-md border-2 border-border bg-card p-7 sm:p-8">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        KBU Hackathon 2026
                    </p>
                    <h1 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tight text-foreground">
                        Password set
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Your password has been saved. You can now sign in with the account credentials associated with
                        this reset link.
                    </p>
                    <PosterButton
                        tone="solid"
                        className="mt-6 w-full border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                        onClick={() => router.push("/login")}
                    >
                        Go to login
                    </PosterButton>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center bg-background px-5 py-16 sm:px-8">
            <div className="w-full max-w-md">
                <BackButton fallbackHref="/" label="Back to KBU Hackathon 2026" className="mb-8" />
                <div className="border-2 border-border bg-card p-7 sm:p-8">
                    <div className="flex size-11 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                        <LockKeyhole className="size-5" aria-hidden="true" />
                    </div>
                    <p className="mt-6 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Password setup
                    </p>
                    <h1 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight text-foreground">
                        Set your password
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Choose a password for your KBU Hackathon 2026 account.
                    </p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <p className="text-sm text-destructive">{submitError}</p>
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="font-display text-sm font-semibold text-foreground">
                                New password
                            </label>
                            <InputGroup className="h-11 border-2 border-border/25 bg-card has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/20">
                                <InputGroupInput
                                    className="h-full px-3 text-base"
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    {...form.register("newPassword")}
                                />
                                <InputGroupButton
                                    type="button"
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowNewPassword((visible) => !visible)}
                                    size="icon-sm"
                                >
                                    {showNewPassword ? (
                                        <EyeOff data-icon="inline-start" />
                                    ) : (
                                        <Eye data-icon="inline-start" />
                                    )}
                                </InputGroupButton>
                            </InputGroup>
                            <FormError message={form.formState.errors.newPassword?.message} />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="font-display text-sm font-semibold text-foreground"
                            >
                                Confirm password
                            </label>
                            <InputGroup className="h-11 border-2 border-border/25 bg-card has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/20">
                                <InputGroupInput
                                    className="h-full px-3 text-base"
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    {...form.register("confirmPassword")}
                                />
                                <InputGroupButton
                                    type="button"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                                    size="icon-sm"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff data-icon="inline-start" />
                                    ) : (
                                        <Eye data-icon="inline-start" />
                                    )}
                                </InputGroupButton>
                            </InputGroup>
                            <FormError message={form.formState.errors.confirmPassword?.message} />
                        </div>
                        <PosterButton
                            tone="solid"
                            type="submit"
                            className="h-11 w-full border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Saving password..." : "Set password"}
                        </PosterButton>
                    </form>
                </div>
            </div>
        </main>
    );
}

function FormError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-destructive">{message}</p> : null;
}
