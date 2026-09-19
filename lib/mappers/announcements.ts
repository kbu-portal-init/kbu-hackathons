import type { Announcement } from "@/generated/prisma/client";
import type { AnnouncementDTO, AnnouncementStatus } from "@/lib/contracts/announcements";

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
