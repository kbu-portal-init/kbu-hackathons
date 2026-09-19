import "server-only";

import type {
    AnnouncementListItem,
    AnnouncementStatus,
    CreateAnnouncementInput,
    UpdateAnnouncementInput,
} from "@/lib/contracts/announcements";
import { toAnnouncementListItem } from "@/lib/mappers/announcements";
import prisma from "@/lib/prisma";

export class AnnouncementError extends Error {
    constructor(
        public code: "NOT_FOUND" | "UPDATE_FAILED",
        message: string,
    ) {
        super(message);
    }
}

function publishedAtFor(status: AnnouncementStatus, existing: Date | null): Date | null {
    if (status === "PUBLISHED") return existing ?? new Date();
    if (status === "ARCHIVED") return null;
    return existing;
}

export async function createAnnouncement(
    input: CreateAnnouncementInput,
    actorId: string,
): Promise<AnnouncementListItem> {
    const record = await prisma.announcement.create({
        data: {
            title: input.title,
            body: input.body,
            status: input.status,
            pinned: input.pinned,
            authorId: actorId,
            publishedAt: publishedAtFor(input.status, null),
        },
        include: { author: { select: { name: true } } },
    });

    await prisma.auditLog.create({
        data: {
            actorId,
            action: "ANNOUNCEMENT_CREATED",
            targetType: "Announcement",
            targetId: record.id,
            details: { title: record.title, status: record.status },
        },
    });

    return toAnnouncementListItem(record);
}

export async function updateAnnouncement(
    input: UpdateAnnouncementInput,
    actorId: string,
): Promise<AnnouncementListItem> {
    const existing = await prisma.announcement.findUnique({ where: { id: input.id } });
    if (!existing) {
        throw new AnnouncementError("NOT_FOUND", "Announcement not found");
    }

    const nextStatus = input.status ?? existing.status;
    const record = await prisma.announcement.update({
        where: { id: input.id },
        data: {
            title: input.title,
            body: input.body,
            status: nextStatus,
            pinned: input.pinned,
            publishedAt: publishedAtFor(nextStatus, existing.publishedAt),
        },
        include: { author: { select: { name: true } } },
    });

    await prisma.auditLog.create({
        data: {
            actorId,
            action: "ANNOUNCEMENT_UPDATED",
            targetType: "Announcement",
            targetId: record.id,
            details: { title: record.title, status: record.status },
        },
    });

    return toAnnouncementListItem(record);
}

export async function deleteAnnouncement(id: string, actorId: string): Promise<void> {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
        throw new AnnouncementError("NOT_FOUND", "Announcement not found");
    }

    await prisma.announcement.delete({ where: { id } });

    await prisma.auditLog.create({
        data: {
            actorId,
            action: "ANNOUNCEMENT_DELETED",
            targetType: "Announcement",
            targetId: id,
            details: { title: existing.title },
        },
    });
}
