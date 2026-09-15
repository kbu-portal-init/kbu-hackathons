import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/prisma";

export async function requireAuth() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || (session.user.banned && (!session.user.banExpires || session.user.banExpires > new Date()))) {
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

export async function requireApprovedTeam() {
    const session = await requireAuth();

    if (session.user.role !== "team") {
        redirect("/login");
    }

    const team = await prisma.team.findUnique({
        where: { userId: session.user.id },
        include: { registration: true },
    });

    if (!team || team.archivedAt || team.registration?.status !== "APPROVED") {
        redirect("/login");
    }

    return { ...session, team };
}
