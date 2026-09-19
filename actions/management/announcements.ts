"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { AnnouncementListItem } from "@/lib/contracts/announcements";
import {
    announcementIdSchema,
    createAnnouncementSchema,
    listAnnouncementsSchema,
    updateAnnouncementSchema,
} from "@/lib/contracts/announcements";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import { listAnnouncements } from "@/lib/data/announcements";
import {
    AnnouncementError,
    createAnnouncement as createAnnouncementService,
    deleteAnnouncement as deleteAnnouncementService,
    updateAnnouncement as updateAnnouncementService,
} from "@/lib/services/announcements";
import { toFieldErrors } from "@/lib/validation/zod";

export async function listPanelAnnouncements(input: unknown): Promise<ListActionResult<AnnouncementListItem>> {
    await requireOrganizerOrAdmin();
    const parsed = listAnnouncementsSchema.safeParse(input ?? {});
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid pagination",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await listAnnouncements(parsed.data) };
}

export async function saveAnnouncement(input: unknown): Promise<ActionResult<AnnouncementListItem>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = createAnnouncementSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Announcement is invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await createAnnouncementService(parsed.data, session.user.id) };
}

export async function updateAnnouncement(input: unknown): Promise<ActionResult<AnnouncementListItem>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = updateAnnouncementSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Announcement is invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    try {
        return { ok: true, data: await updateAnnouncementService(parsed.data, session.user.id) };
    } catch (error) {
        if (error instanceof AnnouncementError) {
            return {
                ok: false,
                error: { code: error.code, message: "Announcement not found" },
            };
        }
        throw error;
    }
}

export async function removeAnnouncement(input: unknown): Promise<ActionResult<{ id: string }>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = announcementIdSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement id",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    try {
        await deleteAnnouncementService(parsed.data.id, session.user.id);
        return { ok: true, data: { id: parsed.data.id } };
    } catch (error) {
        if (error instanceof AnnouncementError) {
            return {
                ok: false,
                error: { code: error.code, message: "Announcement not found" },
            };
        }
        throw error;
    }
}
