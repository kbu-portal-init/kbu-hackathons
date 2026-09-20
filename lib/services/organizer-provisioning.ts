import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/contracts/common";
import type { CreateOrganizerData, CreateOrganizerInput, UpdateOrganizerInput } from "@/lib/contracts/organizers";
import prisma from "@/lib/prisma";
import { isNotificationDeliveryError, sendNotification } from "@/lib/services/notifications";
import { createPasswordSetupUrl } from "@/lib/services/password-reset";

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
        try {
            const resetUrl = await createPasswordSetupUrl(user.id);
            await sendNotification({
                type: "ORGANIZER_ACCOUNT_CREATED",
                recipients: [user.email],
                data: { resetUrl },
                targetType: "User",
                targetId: user.id,
            });
        } catch (error) {
            if (isNotificationDeliveryError(error)) {
                return {
                    ok: false,
                    error: {
                        code: "EMAIL_SEND_FAILED",
                        message:
                            "The organizer account was created, but the password setup email could not be delivered.",
                    },
                };
            }
            return {
                ok: false,
                error: {
                    code: "PASSWORD_SETUP_FAILED",
                    message: "The organizer account was created, but its password setup link could not be prepared.",
                },
            };
        }
        return { ok: true, data: { id: user.id } };
    } catch {
        return { ok: false, error: { code: "CREATE_FAILED", message: "Failed to create organizer account" } };
    }
}
