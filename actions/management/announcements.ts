"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type {
    AnnouncementActionResult,
    AnnouncementListActionResult,
    ListAnnouncementInput,
    ListPublicAnnouncementInput,
    PublicAnnouncementListActionResult,
} from "@/lib/contracts/announcements";
import {
    announcementIdSchema,
    CreateAnnouncementInputSchema,
    ListAnnouncementSchema,
    ListPublicAnnouncementSchema,
    updateAnnouncementSchema,
} from "@/lib/contracts/announcements";
import {
    getAnnouncementById,
    listAnnouncements as listAnnouncementsData,
    listPublicAnnouncements as listPublicAnnouncementsData,
} from "@/lib/data/announcements";
import {
    archiveAnnouncement as archiveAnnouncementService,
    createAnnouncement as createAnnouncementService,
    deleteAnnouncement as deleteAnnouncementService,
    publishAnnouncement as publishAnnouncementService,
    updateAnnouncement as updateAnnouncementService,
} from "@/lib/services/announcements";
import { toFieldErrors } from "@/lib/validation/zod";

export async function listAnnouncements(input: unknown): Promise<AnnouncementListActionResult> {
    await requireOrganizerOrAdmin();

    const parsed = ListAnnouncementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement list filters",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    try {
        return {
            ok: true,
            data: await listAnnouncementsData(parsed.data as ListAnnouncementInput),
        };
    } catch (error) {
        console.error("[announcements] list failed", error);

        return {
            ok: false,
            error: {
                code: "ANNOUNCEMENT_LIST_FAILED",
                message: "Failed to load announcements.",
            },
        };
    }
}

export async function getAnnouncement(input: unknown): Promise<AnnouncementActionResult> {
    await requireOrganizerOrAdmin();

    const parsed = announcementIdSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    let announcement: Awaited<ReturnType<typeof getAnnouncementById>>;

    try {
        announcement = await getAnnouncementById(parsed.data.announcementId);
    } catch (error) {
        console.error("[announcements] fetch failed", error);

        return {
            ok: false,
            error: {
                code: "ANNOUNCEMENT_FETCH_FAILED",
                message: "Failed to load announcement.",
            },
        };
    }

    if (!announcement) {
        return {
            ok: false,
            error: {
                code: "ANNOUNCEMENT_NOT_FOUND",
                message: "Announcement not found",
            },
        };
    }

    return {
        ok: true,
        data: announcement,
    };
}

export async function createAnnouncement(input: unknown): Promise<AnnouncementActionResult> {
    const session = await requireOrganizerOrAdmin();

    const parsed = CreateAnnouncementInputSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement data",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return createAnnouncementService(parsed.data, session.user.id);
}

export async function updateAnnouncement(input: unknown): Promise<AnnouncementActionResult> {
    const session = await requireOrganizerOrAdmin();

    const parsed = updateAnnouncementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement data",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return updateAnnouncementService(parsed.data, session.user.id);
}

export async function publishAnnouncement(input: unknown): Promise<AnnouncementActionResult> {
    const session = await requireOrganizerOrAdmin();

    const parsed = announcementIdSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return publishAnnouncementService(parsed.data, session.user.id);
}

export async function archiveAnnouncement(input: unknown): Promise<AnnouncementActionResult> {
    const session = await requireOrganizerOrAdmin();

    const parsed = announcementIdSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return archiveAnnouncementService(parsed.data, session.user.id);
}

export async function deleteAnnouncement(input: unknown): Promise<AnnouncementActionResult> {
    const session = await requireOrganizerOrAdmin();

    const parsed = announcementIdSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return deleteAnnouncementService(parsed.data, session.user.id);
}

export async function listPublishedAnnouncements(input: unknown): Promise<PublicAnnouncementListActionResult> {
    const parsed = ListPublicAnnouncementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid announcement filters",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    try {
        return {
            ok: true,
            data: await listPublicAnnouncementsData(parsed.data as ListPublicAnnouncementInput),
        };
    } catch (error) {
        console.error("[announcements] public list failed", error);

        return {
            ok: false,
            error: {
                code: "ANNOUNCEMENT_LIST_FAILED",
                message: "Failed to load announcements.",
            },
        };
    }
}
