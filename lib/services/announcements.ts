import "server-only";

import type {
    AnnouncementActionResult,
    AnnouncementIdInput,
    CreateAnnouncementInput,
    UpdateAnnouncementInput,
} from "@/lib/contracts/announcements";
import { mapAnnouncementToDTO } from "@/lib/mappers/announcements";
import prisma from "@/lib/prisma";

function announcementError(error: unknown, fallbackCode: string, fallbackMessage: string) {
    if (error instanceof Error) {
        switch (error.message) {
            case "ANNOUNCEMENT_NOT_FOUND":
                return {
                    code: "ANNOUNCEMENT_NOT_FOUND",
                    message: "Announcement not found",
                };

            case "ANNOUNCEMENT_INVALID_TRANSITION":
                return {
                    code: "ANNOUNCEMENT_INVALID_TRANSITION",
                    message: "Invalid announcement status transition",
                };
        }
    }

    return {
        code: fallbackCode,
        message: fallbackMessage,
    };
}

export async function createAnnouncement(
    input: CreateAnnouncementInput,
    actorId: string,
): Promise<AnnouncementActionResult> {
    try {
        const announcement = await prisma.$transaction(async (tx) => {
            const created = await tx.announcement.create({
                data: {
                    title: input.title,
                    content: input.content,
                    imageUrl: input.imageUrl || null,
                    status: "DRAFT",
                    createdById: actorId,
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "ANNOUNCEMENT_CREATED",
                    targetType: "Announcement",
                    targetId: created.id,
                    details: {
                        title: created.title,
                    },
                },
            });

            return created;
        });

        return {
            ok: true,
            data: mapAnnouncementToDTO(announcement),
        };
    } catch {
        return {
            ok: false,
            error: {
                code: "ANNOUNCEMENT_CREATION_FAILED",
                message: "Failed to create announcement.",
            },
        };
    }
}

export async function updateAnnouncement(
    input: UpdateAnnouncementInput,
    actorId: string,
): Promise<AnnouncementActionResult> {
    try {
        const announcement = await prisma.$transaction(async (tx) => {
            const current = await tx.announcement.findUnique({
                where: {
                    id: input.announcementId,
                },
            });

            if (!current) {
                throw new Error("ANNOUNCEMENT_NOT_FOUND");
            }

            const updated = await tx.announcement.update({
                where: {
                    id: input.announcementId,
                },
                data: {
                    ...(input.title !== undefined ? { title: input.title } : {}),
                    ...(input.content !== undefined ? { content: input.content } : {}),
                    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "ANNOUNCEMENT_UPDATED",
                    targetType: "Announcement",
                    targetId: updated.id,
                    details: {
                        title: updated.title,
                        content: updated.content,
                        imageUrl: updated.imageUrl,
                        status: updated.status,
                    },
                },
            });

            return updated;
        });

        return {
            ok: true,
            data: mapAnnouncementToDTO(announcement),
        };
    } catch (error) {
        return {
            ok: false,
            error: announcementError(error, "ANNOUNCEMENT_UPDATE_FAILED", "Failed to update announcement."),
        };
    }
}

export async function publishAnnouncement(
    input: AnnouncementIdInput,
    actorId: string,
): Promise<AnnouncementActionResult> {
    try {
        const announcement = await prisma.$transaction(async (tx) => {
            const current = await tx.announcement.findUnique({
                where: {
                    id: input.announcementId,
                },
            });

            if (!current) {
                throw new Error("ANNOUNCEMENT_NOT_FOUND");
            }

            if (current.status !== "DRAFT") {
                throw new Error("ANNOUNCEMENT_INVALID_TRANSITION");
            }

            const published = await tx.announcement.update({
                where: {
                    id: current.id,
                },
                data: {
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "ANNOUNCEMENT_PUBLISHED",
                    targetType: "Announcement",
                    targetId: published.id,
                },
            });

            return published;
        });

        return {
            ok: true,
            data: mapAnnouncementToDTO(announcement),
        };
    } catch (error) {
        return {
            ok: false,
            error: announcementError(error, "ANNOUNCEMENT_PUBLISH_FAILED", "Failed to publish announcement."),
        };
    }
}

export async function archiveAnnouncement(
    input: AnnouncementIdInput,
    actorId: string,
): Promise<AnnouncementActionResult> {
    try {
        const announcement = await prisma.$transaction(async (tx) => {
            const current = await tx.announcement.findUnique({
                where: {
                    id: input.announcementId,
                },
            });

            if (!current) {
                throw new Error("ANNOUNCEMENT_NOT_FOUND");
            }

            if (current.status !== "PUBLISHED") {
                throw new Error("ANNOUNCEMENT_INVALID_TRANSITION");
            }

            const archived = await tx.announcement.update({
                where: {
                    id: current.id,
                },
                data: {
                    status: "ARCHIVED",
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "ANNOUNCEMENT_ARCHIVED",
                    targetType: "Announcement",
                    targetId: archived.id,
                },
            });

            return archived;
        });

        return {
            ok: true,
            data: mapAnnouncementToDTO(announcement),
        };
    } catch (error) {
        return {
            ok: false,
            error: announcementError(error, "ANNOUNCEMENT_ARCHIVE_FAILED", "Failed to archive announcement."),
        };
    }
}

export async function deleteAnnouncement(
    input: AnnouncementIdInput,
    actorId: string,
): Promise<AnnouncementActionResult> {
    try {
        const announcement = await prisma.$transaction(async (tx) => {
            const current = await tx.announcement.findUnique({
                where: {
                    id: input.announcementId,
                },
            });

            if (!current) {
                throw new Error("ANNOUNCEMENT_NOT_FOUND");
            }

            if (current.status !== "DRAFT") {
                throw new Error("ANNOUNCEMENT_INVALID_TRANSITION");
            }

            const deleted = await tx.announcement.delete({
                where: {
                    id: current.id,
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "ANNOUNCEMENT_DELETED",
                    targetType: "Announcement",
                    targetId: deleted.id,
                },
            });

            return deleted;
        });

        return {
            ok: true,
            data: mapAnnouncementToDTO(announcement),
        };
    } catch (error) {
        return {
            ok: false,
            error: announcementError(error, "ANNOUNCEMENT_DELETE_FAILED", "Failed to delete announcement."),
        };
    }
}
