"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { loginAsStaff, loginAsTeam } from "@/lib/auth/login-client";
import { type StaffLoginInput, staffLoginSchema, type TeamLoginInput, teamLoginSchema } from "@/lib/contracts/auth";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function LoginContent({ locale }: { locale: Locale }) {
    const t = getMessages(locale).login;
    const [audience, setAudience] = useState<"participant" | "management">("participant");
    const isParticipant = audience === "participant";

    return (
        <main className="flex flex-1 items-center bg-background px-5 py-16 sm:px-8">
            <section className="mx-auto w-full max-w-lg border-2 border-border bg-card">
                <div className="border-b-2 border-border bg-accent text-accent-foreground px-6 py-5 sm:px-8">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-foreground/70">
                        KBU Hackathon 2026
                    </p>
                    <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-[0.9] tracking-tight text-foreground">
                        {t.title}
                    </h1>
                </div>
                <div className="p-6 sm:p-8">
                    <div className="flex w-full border-2 border-border">
                        <button
                            type="button"
                            className={`flex h-11 flex-1 items-center justify-center gap-2 border-r-2 border-border px-4 font-display text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                                isParticipant
                                    ? "bg-foreground text-background"
                                    : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                            aria-pressed={isParticipant}
                            onClick={() => setAudience("participant")}
                        >
                            <Users data-icon="inline-start" />
                            {t.participant}
                        </button>
                        <button
                            type="button"
                            className={`flex h-11 flex-1 items-center justify-center gap-2 px-4 font-display text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                                !isParticipant
                                    ? "bg-foreground text-background"
                                    : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                            aria-pressed={!isParticipant}
                            onClick={() => setAudience("management")}
                        >
                            <ShieldCheck data-icon="inline-start" />
                            {t.management}
                        </button>
                    </div>
                    <div className="mt-8">
                        {isParticipant ? <TeamLoginForm locale={locale} /> : <StaffLoginForm locale={locale} />}
                    </div>
                </div>
            </section>
        </main>
    );
}

function TeamLoginForm({ locale }: { locale: Locale }) {
    const t = getMessages(locale).login;
    const [loginError, setLoginError] = useState<string>();
    const [showPassword, setShowPassword] = useState(false);

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
        toast.success(t.success);
        window.location.href = "/team";
    };

    const usernameError = form.formState.errors.username;
    const passwordError = form.formState.errors.password;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2">
            <FieldGroup>
                {loginError && <FieldError>{loginError}</FieldError>}
                <Field data-invalid={usernameError ? true : undefined}>
                    <FieldLabel htmlFor="username">{t.teamUsername}</FieldLabel>
                    <Input
                        id="username"
                        type="text"
                        autoComplete="username"
                        placeholder="your-team-username"
                        aria-invalid={!!usernameError}
                        className="h-11 text-base"
                        {...form.register("username")}
                    />
                    <FieldError errors={[usernameError]} />
                </Field>
                <Field data-invalid={passwordError ? true : undefined}>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="team-password">{t.password}</FieldLabel>
                        <ForgotPasswordButton
                            identifier="username"
                            getValue={() => form.getValues("username")}
                            focusInput={() => form.setFocus("username")}
                        />
                    </div>
                    <InputGroup className="h-11 border-2 border-border/25 bg-card has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/20">
                        <InputGroupInput
                            id="team-password"
                            className="h-full px-3 text-base"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            aria-invalid={!!passwordError}
                            {...form.register("password")}
                        />
                        <InputGroupButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((visible) => !visible)}
                            size="icon-sm"
                            className="h-full"
                        >
                            {showPassword ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                        </InputGroupButton>
                    </InputGroup>
                    <FieldError errors={[passwordError]} />
                </Field>
                <Button variant="default" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? t.signingIn : t.signIn}
                </Button>
            </FieldGroup>
        </form>
    );
}

function StaffLoginForm({ locale }: { locale: Locale }) {
    const t = getMessages(locale).login;
    const [loginError, setLoginError] = useState<string>();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
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
        router.push("/panel");
        toast.success(t.success);
    };

    const emailError = form.formState.errors.email;
    const passwordError = form.formState.errors.password;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2">
            <FieldGroup>
                {loginError && <FieldError>{loginError}</FieldError>}
                <Field data-invalid={emailError ? true : undefined}>
                    <FieldLabel htmlFor="email">{t.email}</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!emailError}
                        className="h-11 text-base"
                        {...form.register("email")}
                    />
                    <FieldError errors={[emailError]} />
                </Field>
                <Field data-invalid={passwordError ? true : undefined}>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="staff-password">{t.password}</FieldLabel>
                        <ForgotPasswordButton
                            identifier="email"
                            getValue={() => form.getValues("email")}
                            focusInput={() => form.setFocus("email")}
                        />
                    </div>
                    <InputGroup className="h-11 border-2 border-border/25 bg-card has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/20">
                        <InputGroupInput
                            id="staff-password"
                            className="h-full px-3 text-base"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            aria-invalid={!!passwordError}
                            {...form.register("password")}
                        />
                        <InputGroupButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((visible) => !visible)}
                            size="icon-sm"
                            className="h-full"
                        >
                            {showPassword ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                        </InputGroupButton>
                    </InputGroup>
                    <FieldError errors={[passwordError]} />
                </Field>
                <Button variant="default" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? t.signingIn : t.signIn}
                </Button>
            </FieldGroup>
        </form>
    );
}

function ForgotPasswordButton({
    identifier,
    getValue,
    focusInput,
}: {
    identifier: "email" | "username";
    getValue: () => string;
    focusInput: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [message, setMessage] = useState<string>();
    const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");
    const isTeam = identifier === "username";

    const openDialog = () => {
        if (!getValue().trim()) {
            focusInput();
            return;
        }
        setMessage(undefined);
        setMessageType("info");
        setOpen(true);
    };

    const requestReset = async () => {
        const normalizedValue = getValue().trim();
        if (!normalizedValue) {
            setMessage(`Enter your ${isTeam ? "team username" : "email address"} first.`);
            setMessageType("error");
            return;
        }

        setMessage(undefined);
        setIsRequesting(true);
        try {
            const response = await fetch("/api/password-reset/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [identifier]: normalizedValue }),
            });
            const result = (await response.json()) as { message?: string };
            if (!response.ok) {
                setMessage(result.message ?? "Unable to request a password reset.");
                setMessageType("error");
                return;
            }
            setMessage(
                result.message ??
                    "Check your inbox for password reset instructions. If you do not see an email, check your spam folder.",
            );
            setMessageType("success");
        } catch {
            setMessage("Unable to request a password reset. Please try again.");
            setMessageType("error");
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <>
            <Button
                variant="link"
                type="button"
                size="sm"
                className="h-auto px-0 text-xs underline decoration-primary decoration-2 underline-offset-4"
                onClick={openDialog}
            >
                Forgot password?
            </Button>
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!isRequesting) setOpen(nextOpen);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display">Reset your password</DialogTitle>
                        <DialogDescription>
                            {isTeam
                                ? "We will send password-reset instructions to the verified leader email for this team."
                                : "We will send password-reset instructions to the email address on your account."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {isTeam ? "Team username" : "Email address"}: {getValue().trim() || "Not provided"}
                        </p>
                        {message && (
                            <p
                                className={
                                    messageType === "error"
                                        ? "text-sm font-medium text-red-600"
                                        : messageType === "success"
                                          ? "text-sm font-medium text-green-600"
                                          : "text-sm text-muted-foreground"
                                }
                                role={messageType === "error" ? "alert" : "status"}
                            >
                                {message}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" disabled={isRequesting} />}>Close</DialogClose>
                        {messageType !== "success" && (
                            <Button variant="brand" type="button" onClick={requestReset} disabled={isRequesting}>
                                {isRequesting ? "Sending..." : "Send reset link"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
