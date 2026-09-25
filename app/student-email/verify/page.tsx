"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyTeamMemberEmail } from "@/actions/auth";
import { BackButton } from "@/components/back-button";

type VerifyState = "loading" | "success" | "approved" | "approvedNoEmail" | "allVerified" | "already" | "error";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [state, setState] = useState<VerifyState>("loading");

    useEffect(() => {
        if (!token) {
            setState("error");
            return;
        }

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
            <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        <XCircle className="size-7" />
                    </div>
                    <h1 className="mt-6 text-2xl font-bold tracking-tight">Invalid link</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        This verification link is missing a token. Please check the email you received and try again.
                    </p>
                    <BackButton fallbackHref="/" label="Back to home" className="mt-8" />
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
            <div className="w-full max-w-md text-center">
                {state === "loading" && (
                    <>
                        <Loader2 className="mx-auto size-10 animate-spin text-orange-600" />
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">Verifying your email...</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            Please wait while we confirm your email address.
                        </p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">Email verified!</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            Your student email has been confirmed. Once all team members have verified their emails, an
                            organizer will review and approve your registration.
                        </p>
                    </>
                )}

                {state === "allVerified" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">All emails verified!</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            All team members have verified their emails. An organizer will review and approve your
                            registration. You will receive your login credentials once approved.
                        </p>
                    </>
                )}

                {state === "approved" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">Team approved!</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            All team members have verified their emails. The team was automatically approved, and the
                            leader received a password-reset link.
                        </p>
                    </>
                )}

                {state === "approvedNoEmail" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">Team approved</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            Your team was automatically approved, but the leader&apos;s password-reset email could not
                            be delivered. Please contact the organizers for help.
                        </p>
                    </>
                )}

                {state === "already" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">Already verified</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            This email has already been verified. No further action is needed.
                        </p>
                    </>
                )}

                {state === "error" && (
                    <>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            <XCircle className="size-7" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight">Verification failed</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                            This verification link is invalid or has expired. Please contact your team leader or the
                            event organizers to request a new link.
                        </p>
                    </>
                )}

                <BackButton fallbackHref="/" label="Back to home" className="mt-8" />
            </div>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <main className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16 dark:bg-orange-950/10">
                    <Loader2 className="size-10 animate-spin text-orange-600" />
                </main>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}
