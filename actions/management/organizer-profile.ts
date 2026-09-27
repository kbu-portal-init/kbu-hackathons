"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import {
    changeOrganizerPasswordSchema,
    type OrganizerProfileActionData,
    updateOrganizerProfileSchema,
} from "@/lib/contracts/organizer-profile";
import { getOrganizerProfile } from "@/lib/data/organizer-profile";
import prisma from "@/lib/prisma";
import { isOwnedR2PublicUrl } from "@/lib/r2";
import { deleteOwnedR2PublicUrl } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

export async function getCurrentOrganizerProfile(): Promise<ActionResult<OrganizerProfileActionData>> {
    const session = await requireOrganizerOrAdmin();
    if (session.user.role !== "organizer") {
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "Organizer access required" } };
    }
    const profile = await getOrganizerProfile(session.user.id);
    return profile
        ? { ok: true, data: { profile } }
        : { ok: false, error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: "Profile not found" } };
}

export async function updateOrganizerProfile(input: unknown): Promise<ActionResult<OrganizerProfileActionData>> {
    const session = await requireOrganizerOrAdmin();
    if (session.user.role !== "organizer") {
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "Organizer access required" } };
    }
    const parsed = updateOrganizerProfileSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Some fields are invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    if (parsed.data.image && !isOwnedR2PublicUrl(parsed.data.image, `uploads/organizers/${session.user.id}`)) {
        return {
            ok: false,
            error: { code: ErrorCodes.IMAGE_NOT_OWNED, message: "Profile image is not owned by this organizer" },
        };
    }
    try {
        const existing = await getOrganizerProfile(session.user.id);
        const nextImage = parsed.data.image === undefined ? (existing?.image ?? null) : parsed.data.image;
        await auth.api.updateUser({
            headers: await headers(),
            body: { name: parsed.data.name, image: nextImage },
        });
        await prisma.user.update({ where: { id: session.user.id }, data: { email: parsed.data.email } });
        if (existing?.image && existing.image !== nextImage) {
            const cleanup = await deleteOwnedR2PublicUrl(existing.image, `organizers/${session.user.id}`);
            if (!cleanup.ok) console.error("[organizer-profile] old image cleanup failed", cleanup.error);
        }
        const profile = await getOrganizerProfile(session.user.id);
        return profile
            ? { ok: true, data: { profile } }
            : { ok: false, error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: "Profile not found" } };
    } catch {
        return { ok: false, error: { code: ErrorCodes.PROFILE_UPDATE_FAILED, message: "Failed to update profile" } };
    }
}

export async function changeOrganizerPassword(input: unknown): Promise<ActionResult<{ changed: true }>> {
    await requireOrganizerOrAdmin();
    const parsed = changeOrganizerPasswordSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Some fields are invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
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
                message: "Current password is incorrect or password could not be changed",
            },
        };
    }
}
