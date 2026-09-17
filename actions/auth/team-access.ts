"use server";

import { auth } from "@/lib/auth/config";
import prisma from "@/lib/prisma";

export async function checkTeamAccess(): Promise<{ approved: boolean; message?: string }> {
    const session = await auth.api.getSession({
        headers: await import("next/headers").then((m) => m.headers()),
    });

    const user = session?.user;
    if (user?.role !== "team") {
        return { approved: false, message: "Unauthorized" };
    }

    const team = await prisma.team.findUnique({
        where: { userId: user.id },
        include: { registration: true },
    });

    if (!team || team.archivedAt) {
        return { approved: false, message: "Team not found" };
    }

    const status = team.registration?.status;

    if (status === "APPROVED") {
        return { approved: true };
    }

    const message =
        status === "PENDING"
            ? "Your team registration is still pending review. Please wait for organizer approval."
            : status === "REJECTED"
              ? "Your team registration was not approved. Please contact the event organizers."
              : "Your team is not approved to access the dashboard.";

    return { approved: false, message };
}
