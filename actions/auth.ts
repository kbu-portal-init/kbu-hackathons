import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

export async function requireAuth() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    return session;
}

export async function requireOrganizerOrAdmin() {
    const session = await requireAuth();

    if (session.user.role !== "organizer" && session.user.role !== "admin") {
        redirect("/login");
    }

    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();

    if (session.user.role !== "admin") {
        redirect("/login");
    }

    return session;
}

export function getUserRole(role: string | null | undefined): UserRole | null {
    if (role === "user" || role === "organizer" || role === "admin") {
        return role;
    }
    return null;
}
