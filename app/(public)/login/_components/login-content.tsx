"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FieldValues, type Path, type SubmitHandler, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginAsStaff, loginAsTeam } from "@/actions/auth/login";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { type StaffLoginInput, staffLoginSchema, type TeamLoginInput, teamLoginSchema } from "@/lib/contracts/auth";

type LoginContentProps = { audience: "participant" | "management"; title: string; description: string };

export function LoginContent({ audience, title, description }: LoginContentProps) {
    const router = useRouter();

    const { isPending } = authClient.useSession();

    const isParticipant = audience === "participant";
    if (isPending) return <Loader />;

    const onSuccess = () => {
        router.push(isParticipant ? "/teams" : "/panel");
        toast.success("Sign in successful");
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
                    {isParticipant ? <TeamLoginForm onSuccess={onSuccess} /> : <StaffLoginForm onSuccess={onSuccess} />}
                </div>
            </div>
        </main>
    );
}

function TeamLoginForm({ onSuccess }: { onSuccess: () => void }) {
    const form = useForm<TeamLoginInput>({
        resolver: zodResolver(teamLoginSchema),
        defaultValues: { username: "", password: "" },
    });
    const onSubmit = async (values: TeamLoginInput) => {
        const result = await loginAsTeam(values, loginCallbacks(onSuccess));
        if (result?.error) toast.error(typeof result.error === "string" ? result.error : result.error.message);
    };
    return (
        <LoginFields
            form={form}
            identifierName="username"
            identifierLabel="Team name"
            identifierType="text"
            autoComplete="username"
            placeholder="Enter your team name we sent you in the email"
            onSubmit={onSubmit}
        />
    );
}

function StaffLoginForm({ onSuccess }: { onSuccess: () => void }) {
    const form = useForm<StaffLoginInput>({
        resolver: zodResolver(staffLoginSchema),
        defaultValues: { email: "", password: "" },
    });
    const onSubmit = async (values: StaffLoginInput) => {
        const result = await loginAsStaff(values, loginCallbacks(onSuccess));
        if (result?.error) toast.error(typeof result.error === "string" ? result.error : result.error.message);
    };
    return (
        <LoginFields
            form={form}
            identifierName="email"
            identifierLabel="Email address"
            identifierType="email"
            autoComplete="email"
            placeholder="you@example.com"
            onSubmit={onSubmit}
        />
    );
}

function LoginFields<TFieldValues extends FieldValues>({
    form,
    identifierName,
    identifierLabel,
    identifierType,
    autoComplete,
    placeholder,
    onSubmit,
}: {
    form: UseFormReturn<TFieldValues>;
    identifierName: Path<TFieldValues>;
    identifierLabel: string;
    identifierType: "email" | "text";
    autoComplete: string;
    placeholder: string;
    onSubmit: SubmitHandler<TFieldValues>;
}) {
    const identifierError = getErrorMessage(form.formState.errors[identifierName]);
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="space-y-2">
                <label htmlFor={identifierName} className="text-sm font-medium">
                    {identifierLabel}
                </label>
                <Input
                    id={identifierName}
                    type={identifierType}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-invalid={!!identifierError}
                    {...form.register(identifierName)}
                />
                <FormError message={identifierError} />
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
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register("password" as Path<TFieldValues>)}
                />
                <FormError message={getErrorMessage(form.formState.errors.password)} />
            </div>
            <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}

function loginCallbacks(onSuccess: () => void) {
    return {
        onSuccess,
        onError: (error: { error: { message?: string; statusText?: string } }) => {
            toast.error(error.error.message || error.error.statusText);
        },
    };
}

function FormError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-red-500">{message}</p> : null;
}

function getErrorMessage(error: unknown) {
    return typeof error === "object" && error && "message" in error && typeof error.message === "string"
        ? error.message
        : undefined;
}
