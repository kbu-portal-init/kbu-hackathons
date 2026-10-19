"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { verifyTeamMemberEmail } from "@/actions/auth";
import { BackButton } from "@/components/back-button";

type VerifyState = "loading" | "success" | "approved" | "approvedNoEmail" | "allVerified" | "already" | "error";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [state, setState] = useState<VerifyState>("loading");
    const requestedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setState("error");
            return;
        }

        if (requestedRef.current) {
            return;
        }
        requestedRef.current = true;

        verifyTeamMemberEmail(token).then((result) => {
            if (!result.ok) {
                setState("error");
                return;
            }
            if (result.data.alreadyVerified) {
                setState("already");
            } else if (result.data.autoApproved) {
                setState(result.data.passwordSetupSent ? "approved" : "approvedNoEmail");
            } else if (result.data.allVerified) {
                setState("allVerified");
            } else {
                setState("success");
            }
        });
    }, [token]);

    if (!token) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
                <div className="w-full max-w-md border-2 border-border bg-card p-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-destructive/10 text-destructive">
                        <XCircle className="size-7" />
                    </div>
                    <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                        Invalid link
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        This verification link is incomplete or invalid. Please open the link directly from your email,
                        or contact your team leader or the event organizers for a new link.
                    </p>
                    <BackButton fallbackHref="/" label="Back to home" className="mt-8" useHistory={false} />
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <div className="w-full max-w-md border-2 border-border bg-card p-8 text-center">
                {state === "loading" && (
                    <>
                        <Loader2 className="mx-auto size-10 animate-spin text-primary" />
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            Verifying your email...
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Please wait while we confirm your email address.
                        </p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            Email verified!
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Your student email has been confirmed. Once all team members have verified their emails, an
                            organizer will review and approve your registration.
                        </p>
                    </>
                )}

                {state === "allVerified" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            All emails verified!
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            All team members have verified their emails. An organizer will review and approve your
                            registration. You will receive your login credentials once approved.
                        </p>
                    </>
                )}

                {state === "approved" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            Team approved!
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            All team members have verified their emails. The team was automatically approved, and the
                            leader received a password-reset link.
                        </p>
                    </>
                )}

                {state === "approvedNoEmail" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            Team approved
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Your team was automatically approved, but the leader&apos;s password-reset email could not
                            be delivered. Please contact the organizers for help.
                        </p>
                    </>
                )}

                {state === "already" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            Already verified
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            This email has already been verified. No further action is needed.
                        </p>
                    </>
                )}

                {state === "error" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-destructive/10 text-destructive">
                            <XCircle className="size-7" />
                        </div>
                        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
                            Verification failed
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            We couldn&apos;t verify this email because the link is invalid or has expired. Please
                            contact your team leader or the event organizers to request a new verification link.
                        </p>
                    </>
                )}

                {state !== "loading" && (
                    <BackButton fallbackHref="/" label="Back to home" className="mt-8" useHistory={false} />
                )}
            </div>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
                    <Loader2 className="size-10 animate-spin text-primary" />
                </main>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}
