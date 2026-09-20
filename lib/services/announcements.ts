import "server-only";

import type { Prisma } from "@/generated/prisma/client";
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

    console.error(`[announcements] ${fallbackCode}`, error);

    return {
        code: fallbackCode,
        message: fallbackMessage,
    };
}

async function transitionError(tx: Prisma.TransactionClient, id: string): Promise<Error> {
    const exists = await tx.announcement.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    return new Error(exists ? "ANNOUNCEMENT_INVALID_TRANSITION" : "ANNOUNCEMENT_NOT_FOUND");
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
    } catch (error) {
        console.error("[announcements] ANNOUNCEMENT_CREATION_FAILED", error);

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
            const { count } = await tx.announcement.updateMany({
                where: {
                    id: input.announcementId,
                    status: "DRAFT",
                },
                data: {
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
            });

            if (count === 0) {
                throw await transitionError(tx, input.announcementId);
            }

            const published = await tx.announcement.findUniqueOrThrow({
                where: {
                    id: input.announcementId,
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
            const { count } = await tx.announcement.updateMany({
                where: {
                    id: input.announcementId,
                    status: "PUBLISHED",
                },
                data: {
                    status: "ARCHIVED",
                },
            });

            if (count === 0) {
                throw await transitionError(tx, input.announcementId);
            }

            const archived = await tx.announcement.findUniqueOrThrow({
                where: {
                    id: input.announcementId,
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

            const { count } = await tx.announcement.deleteMany({
                where: {
                    id: current.id,
                    status: "DRAFT",
                },
            });

            if (count === 0) {
                throw new Error("ANNOUNCEMENT_INVALID_TRANSITION");
            }

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "ANNOUNCEMENT_DELETED",
                    targetType: "Announcement",
                    targetId: current.id,
                },
            });

            return current;
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
