"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
        <main className="flex flex-1 items-center justify-center bg-violet-50/70 px-6 py-16">
            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-violet-700"
                >
                    <ArrowLeft className="size-4" /> Back to KBU Hub
                </Link>
                <div className="rounded-2xl border border-violet-200 bg-white p-7 shadow-xl shadow-violet-200/50">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        {isParticipant ? <Mail className="size-5" /> : <LockKeyhole className="size-5" />}
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-violet-700">
                        {isParticipant ? "Participant access" : "Management access"}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
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
            {loginError && <p className="text-sm font-medium text-rose-600">{loginError}</p>}
            <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-700">
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
                {usernameError && <p className="text-sm font-medium text-rose-600">{usernameError.message}</p>}
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
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
                {passwordError && <p className="text-sm font-medium text-rose-600">{passwordError.message}</p>}
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
            {loginError && <p className="text-sm font-medium text-rose-600">{loginError}</p>}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
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
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <span className="text-xs text-slate-500">Forgot password?</span>
                </div>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={!!passwordError}
                    {...form.register("password")}
                />
                {passwordError && <p className="text-sm font-medium text-rose-600">{passwordError.message}</p>}
            </div>
            <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}
