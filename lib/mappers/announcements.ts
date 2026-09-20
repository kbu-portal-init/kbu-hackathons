import type { Announcement } from "@/generated/prisma/client";
import type { AnnouncementDTO, AnnouncementStatus, PublicAnnouncementDTO } from "@/lib/contracts/announcements";

export function mapAnnouncementToDTO(announcement: Announcement): AnnouncementDTO {
    return {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        imageUrl: announcement.imageUrl,
        status: announcement.status as AnnouncementStatus,
        publishedAt: announcement.publishedAt ? announcement.publishedAt.toISOString() : null,
        createdById: announcement.createdById,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
    };
}

export function mapAnnouncementToPublicDTO(announcement: Announcement): PublicAnnouncementDTO {
    return {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        imageUrl: announcement.imageUrl,
        publishedAt: announcement.publishedAt ? announcement.publishedAt.toISOString() : null,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
    };
}
