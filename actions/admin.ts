"use server";

import z from "zod";
import { requireAdmin } from "@/actions/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const createOrganizerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

async function promoteToOrganizer(email: string) {
    // Idempotent: safe to run again on a user that's already (partially) promoted.
    return prisma.user.update({
        where: { email },
        data: {
            role: "organizer",
            emailVerified: true,
            organizerProfile: {
                upsert: {
                    create: {},
                    update: {},
                },
            },
        },
        include: { organizerProfile: true },
    });
}

export async function createOrganizer(formData: { name: string; email: string; password: string }) {
    const _session = await requireAdmin();

    const parsed = createOrganizerSchema.safeParse(formData);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({
        where: { email },
        include: { organizerProfile: true },
    });

    if (existing) {
        // Already a fully-provisioned organizer -> genuine duplicate, refuse.
        if (existing.role === "organizer" && existing.organizerProfile) {
            return { error: "A user with this email already exists" };
        }

        // Otherwise this is a leftover from a previous signUpEmail that
        // succeeded but the follow-up promotion failed. Repair it instead
        // of returning a dead-end "already exists" error. (Note: the
        // password supplied here is ignored in this path, since the auth
        // record already exists from the earlier attempt.)
        try {
            await promoteToOrganizer(email);
            return { success: true };
        } catch (_error) {
            return { error: "Failed to create organizer account" };
        }
    }

    try {
        await auth.api.signUpEmail({
            body: { name, email, password },
        });
    } catch (_error) {
        return { error: "Failed to create organizer account" };
    }

    try {
        await promoteToOrganizer(email);
        return { success: true };
    } catch (_error) {
        // The auth user was created but promotion failed. Clean it up so
        // the email isn't stuck in limbo and a retry can go through
        // signUpEmail cleanly again.
        try {
            await prisma.user.delete({ where: { email } });
        } catch {
            // Best-effort cleanup; if this also fails, the repair branch
            // above will pick the row up on the next attempt anyway.
        }
        return { error: "Failed to create organizer account" };
    }
}
