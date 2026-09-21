"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const roleDestinations = {
    team: "/team",
    organizer: "/panel",
    admin: "/admin",
} as const;

export function HomeAuthRedirect() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const userRole = (session?.user as { role?: unknown } | undefined)?.role;
    const role =
        typeof userRole === "string" && userRole in roleDestinations
            ? (userRole as keyof typeof roleDestinations)
            : undefined;

    useEffect(() => {
        const destination = role ? roleDestinations[role] : undefined;

        if (destination) {
            router.replace(destination);
        }
    }, [role, router]);

    return null;
}
