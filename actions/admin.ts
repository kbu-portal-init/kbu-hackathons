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

export async function createOrganizer(formData: { name: string; email: string; password: string }) {
    const _session = await requireAdmin();

    const parsed = createOrganizerSchema.safeParse(formData);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "A user with this email already exists" };
    }

    try {
        await auth.api.signUpEmail({
            body: { name, email, password },
        });

        await prisma.user.update({
            where: { email },
            data: {
                role: "organizer",
                emailVerified: true,
                organizerProfile: { create: {} },
            },
        });

        return { success: true };
    } catch (_error) {
        return { error: "Failed to create organizer account" };
    }
}
