"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { requireAdmin } from "@/lib/auth/guards";
import {
    type AdminProfileActionData,
    changeAdminPasswordSchema,
    updateAdminProfileSchema,
} from "@/lib/contracts/admin-profile";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import { getAdminProfile } from "@/lib/data/admin-profile";
import prisma from "@/lib/prisma";
import { isOwnedR2PublicUrl } from "@/lib/r2";
import { toFieldErrors } from "@/lib/validation/zod";

export async function getCurrentAdminProfile(): Promise<ActionResult<AdminProfileActionData>> {
    const session = await requireAdmin();
    const profile = await getAdminProfile(session.user.id);

    return profile
        ? { ok: true, data: { profile } }
        : { ok: false, error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: "Admin profile not found" } };
}

export async function updateAdminProfile(input: unknown): Promise<ActionResult<AdminProfileActionData>> {
    const session = await requireAdmin();

    const parsed = updateAdminProfileSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: ErrorMessages[ErrorCodes.VALIDATION_ERROR],
                fieldErrors: toFieldErrors(parsed.error),
            },
        };

    if (parsed.data.image && !isOwnedR2PublicUrl(parsed.data.image, `uploads/admins/${session.user.id}`)) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.IMAGE_NOT_OWNED,
                message: "Profile image must be uploaded to your admin storage area",
            },
        };
    }

    try {
        const existing = await prisma.user.findFirst({
            where: { email: parsed.data.email, NOT: { id: session.user.id } },
            select: { id: true },
        });
        if (existing)
            return {
                ok: false,
                error: { code: ErrorCodes.EMAIL_EXISTS, message: ErrorMessages[ErrorCodes.EMAIL_EXISTS] },
            };
        await auth.api.updateUser({
            headers: await headers(),
            body: { name: parsed.data.name, image: parsed.data.image ?? null },
        });
        await prisma.user.update({ where: { id: session.user.id }, data: { email: parsed.data.email } });
        const profile = await getAdminProfile(session.user.id);
        return profile
            ? { ok: true, data: { profile } }
            : { ok: false, error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: "Admin profile not found" } };
    } catch {
        return {
            ok: false,
            error: { code: ErrorCodes.PROFILE_UPDATE_FAILED, message: ErrorMessages[ErrorCodes.PROFILE_UPDATE_FAILED] },
        };
    }
}

export async function changeAdminPassword(input: unknown): Promise<ActionResult<{ changed: true }>> {
    await requireAdmin();

    const parsed = changeAdminPasswordSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: ErrorMessages[ErrorCodes.VALIDATION_ERROR],
                fieldErrors: toFieldErrors(parsed.error),
            },
        };

    try {
        await auth.api.changePassword({
            headers: await headers(),
            body: {
                currentPassword: parsed.data.currentPassword,
                newPassword: parsed.data.newPassword,
                revokeOtherSessions: false,
            },
        });
        return { ok: true, data: { changed: true } };
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.PASSWORD_CHANGE_FAILED,
                message: ErrorMessages[ErrorCodes.PASSWORD_CHANGE_FAILED],
            },
        };
    }
}
