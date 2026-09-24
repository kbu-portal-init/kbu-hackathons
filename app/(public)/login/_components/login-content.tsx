"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAsStaff, loginAsTeam } from "@/lib/auth/login-client";
import { type StaffLoginInput, staffLoginSchema, type TeamLoginInput, teamLoginSchema } from "@/lib/contracts/auth";

type LoginContentProps = { audience: "participant" | "management"; title: string; description: string };

export function LoginContent({ audience, title, description }: LoginContentProps) {
    const router = useRouter();

    const isParticipant = audience === "participant";

    const onSuccess = () => {
        router.push(isParticipant ? "/team" : "/panel");
        toast.success("Sign in successful");
    };

    return (
        <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
            <div className="w-full max-w-md">
                <BackButton fallbackHref="/" label="Back to KBU Hackathon 2026" className="mb-8" />
                <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                        {isParticipant ? <Mail className="size-5" /> : <LockKeyhole className="size-5" />}
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-orange-600">
                        {isParticipant ? "Participant access" : "Management access"}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
                    {isParticipant ? <TeamLoginForm /> : <StaffLoginForm onSuccess={onSuccess} />}
                </div>
            </div>
        </main>
    );
}

function TeamLoginForm() {
    const [loginError, setLoginError] = useState<string>();

    const form = useForm<TeamLoginInput>({
        resolver: zodResolver(teamLoginSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = async (values: TeamLoginInput) => {
        setLoginError(undefined);
        const result = await loginAsTeam(values);
        if (!result.ok) {
            setLoginError(result.error.message);
            return;
        }
        toast.success("Sign in successful");
        window.location.href = "/team";
    };

    const usernameError = form.formState.errors.username;
    const passwordError = form.formState.errors.password;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                    Team username
                </label>
                <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="kbu-ai-builders"
                    aria-invalid={!!usernameError}
                    {...form.register("username")}
                />
                {usernameError && <p className="text-sm text-red-500">{usernameError.message}</p>}
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={!!passwordError}
                    {...form.register("password")}
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError.message}</p>}
            </div>
            <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}

function StaffLoginForm({ onSuccess }: { onSuccess: () => void }) {
    const [loginError, setLoginError] = useState<string>();
    const form = useForm<StaffLoginInput>({
        resolver: zodResolver(staffLoginSchema),
        defaultValues: { email: "", password: "" },
    });
    const onSubmit = async (values: StaffLoginInput) => {
        setLoginError(undefined);
        const result = await loginAsStaff(values);
        if (!result.ok) {
            setLoginError(result.error.message);
            return;
        }
        onSuccess();
    };

    const emailError = form.formState.errors.email;
    const passwordError = form.formState.errors.password;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email address
                </label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!emailError}
                    {...form.register("email")}
                />
                {emailError && <p className="text-sm text-red-500">{emailError.message}</p>}
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
                    aria-invalid={!!passwordError}
                    {...form.register("password")}
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError.message}</p>}
            </div>
            <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}
