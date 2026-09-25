"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSessionHint, hasSessionHint } from "@/lib/auth/session-hint";
import { authClient } from "@/lib/auth-client";

const roleDestinations = {
    team: "/team",
    organizer: "/panel",
    admin: "/admin",
} as const;

export function HomeAuthRedirect() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [sessionHint, setSessionHint] = useState(false);
    const userRole = (session?.user as { role?: unknown } | undefined)?.role;
    const role =
        typeof userRole === "string" && userRole in roleDestinations
            ? (userRole as keyof typeof roleDestinations)
            : undefined;

    useEffect(() => {
        setSessionHint(hasSessionHint());
    }, []);

    useEffect(() => {
        const destination = role ? roleDestinations[role] : undefined;

        if (destination) {
            router.replace(destination);
            return;
        }

        if (sessionHint && !isPending) {
            clearSessionHint();
            setSessionHint(false);
        }
    }, [isPending, role, router, sessionHint]);

    useEffect(() => {
        if (!(sessionHint && isPending)) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isPending, sessionHint]);

    if (sessionHint && isPending) {
        return (
            <div
                className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white"
                role="status"
                aria-label="Checking your session"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Checking your session…</p>
                </div>
            </div>
        );
    }

    return null;
}
