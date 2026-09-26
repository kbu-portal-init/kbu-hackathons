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

export function LoginContent() {
    const [audience, setAudience] = useState<"participant" | "management">("participant");
    const isParticipant = audience === "participant";

    return (
        <main className="flex flex-1 items-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
            <section className="mx-auto w-full max-w-md">
                <h1 className="text-3xl font-bold tracking-tight">Sign in to KBU Hackathon 2026</h1>
                <div className="mt-6 flex w-full gap-1 rounded-xl bg-muted p-1">
                    <Button
                        type="button"
                        variant={isParticipant ? "default" : "outline"}
                        className="h-10 flex-1 gap-2 px-4"
                        aria-pressed={isParticipant}
                        onClick={() => setAudience("participant")}
                    >
                        <Users data-icon="inline-start" />
                        Participant
                    </Button>
                    <Button
                        type="button"
                        variant={!isParticipant ? "default" : "outline"}
                        className="h-10 flex-1 gap-2 px-4"
                        aria-pressed={!isParticipant}
                        onClick={() => setAudience("management")}
                    >
                        <ShieldCheck data-icon="inline-start" />
                        Management
                    </Button>
                </div>
                <div className="mt-8">{isParticipant ? <TeamLoginForm /> : <StaffLoginForm />}</div>
            </section>
        </main>
    );
}

function TeamLoginForm() {
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
        toast.success("Sign in successful");
        window.location.href = "/team";
    };

    const usernameError = form.formState.errors.username;
    const passwordError = form.formState.errors.password;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 lg:mt-2">
            <FieldGroup>
                {loginError && <FieldError>{loginError}</FieldError>}
                <Field data-invalid={usernameError ? true : undefined}>
                    <FieldLabel htmlFor="username">Team username</FieldLabel>
                    <Input
                        id="username"
                        type="text"
                        autoComplete="username"
                        placeholder="kbu-ai-builders"
                        aria-invalid={!!usernameError}
                        {...form.register("username")}
                    />
                    <FieldError errors={[usernameError]} />
                </Field>
                <Field data-invalid={passwordError ? true : undefined}>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="team-password">Password</FieldLabel>
                        <ForgotPasswordButton
                            identifier="username"
                            getValue={() => form.getValues("username")}
                            focusInput={() => form.setFocus("username")}
                        />
                    </div>
                    <InputGroup>
                        <InputGroupInput
                            id="team-password"
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
                        >
                            {showPassword ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                        </InputGroupButton>
                    </InputGroup>
                    <FieldError errors={[passwordError]} />
                </Field>
                <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
            </FieldGroup>
        </form>
    );
}

function StaffLoginForm() {
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
        toast.success("Sign in successful");
    };

    const emailError = form.formState.errors.email;
    const passwordError = form.formState.errors.password;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 lg:mt-2">
            <FieldGroup>
                {loginError && <FieldError>{loginError}</FieldError>}
                <Field data-invalid={emailError ? true : undefined}>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!emailError}
                        {...form.register("email")}
                    />
                    <FieldError errors={[emailError]} />
                </Field>
                <Field data-invalid={passwordError ? true : undefined}>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="staff-password">Password</FieldLabel>
                        <ForgotPasswordButton
                            identifier="email"
                            getValue={() => form.getValues("email")}
                            focusInput={() => form.setFocus("email")}
                        />
                    </div>
                    <InputGroup>
                        <InputGroupInput
                            id="staff-password"
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
                        >
                            {showPassword ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                        </InputGroupButton>
                    </InputGroup>
                    <FieldError errors={[passwordError]} />
                </Field>
                <Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
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
            <Button type="button" variant="link" size="sm" className="h-auto px-0 text-xs" onClick={openDialog}>
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
                        <DialogTitle>Reset your password</DialogTitle>
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
                            <Button type="button" onClick={requestReset} disabled={isRequesting}>
                                {isRequesting ? "Sending..." : "Send reset link"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
