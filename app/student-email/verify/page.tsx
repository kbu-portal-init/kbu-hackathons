"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyTeamMemberEmail } from "@/actions/auth/verify-email";

type VerifyState = "loading" | "success" | "already" | "error";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [state, setState] = useState<VerifyState>("loading");
    const [, setAllVerified] = useState(false);

    useEffect(() => {
        if (!token) {
            setState("error");
            return;
        }

        verifyTeamMemberEmail(token).then((result) => {
            console.log("Verification result:", result);

            if (!result.ok) {
                console.log("Verification result:", result);
                setState("error");
                return;
            }
            setAllVerified(result.data.allVerified);
            setState(result.data.verified && !result.data.allVerified ? "success" : "already");
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
                    <Link
                        href="/"
                        className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
                    >
                        Back to home
                    </Link>
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
                            Your student email has been confirmed. Once all team members have verified their emails,
                            your team will be automatically approved and you will receive your login credentials.
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

                <Link
                    href="/"
                    className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
                >
                    Back to home
                </Link>
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
