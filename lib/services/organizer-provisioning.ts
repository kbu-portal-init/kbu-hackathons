import "server-only";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/contracts/common";
import type { UpdateOrganizerInput } from "@/lib/contracts/organizers";

export async function updateOrganizer(input: UpdateOrganizerInput): Promise<ActionResult<{ id: string }>> {
    const user = await prisma.user.findFirst({ where: { id: input.userId, role: "organizer" } });
    if (!user) return { ok: false, error: { code: "ORGANIZER_NOT_FOUND", message: "Organizer not found" } };
    const { userId, ...data } = input;
    try {
        await auth.api.adminUpdateUser({ body: { userId, data }, headers: await headers() });
        return { ok: true, data: { id: userId } };
    } catch {
        return { ok: false, error: { code: "UPDATE_FAILED", message: "Failed to update organizer" } };
    }
}

import type { CreateOrganizerData, CreateOrganizerInput } from "@/lib/contracts/organizers";
import prisma from "@/lib/prisma";

export async function provisionOrganizer(input: CreateOrganizerInput): Promise<ActionResult<CreateOrganizerData>> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        return { ok: false, error: { code: "EMAIL_EXISTS", message: "A user with this email already exists" } };
    }

    try {
        await auth.api.signUpEmail({ body: input });
        const user = await prisma.user.update({
            where: { email: input.email },
            data: { role: "organizer", emailVerified: true },
        });
        return { ok: true, data: { id: user.id } };
    } catch {
        return { ok: false, error: { code: "CREATE_FAILED", message: "Failed to create organizer account" } };
    }
}
