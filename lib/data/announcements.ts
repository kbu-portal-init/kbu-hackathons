import "server-only";

import type {
    AnnouncementDTO,
    ListAnnouncementInput,
    ListPublicAnnouncementInput,
} from "@/lib/contracts/announcements";
import type { ListResult } from "@/lib/contracts/common";
import { DEFAULT_PAGE_SIZE } from "@/lib/contracts/common";
import { mapAnnouncementToDTO } from "@/lib/mappers/announcements";
import prisma from "@/lib/prisma";

export async function listAnnouncements(input: ListAnnouncementInput): Promise<ListResult<AnnouncementDTO>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    const search = input.search ? input.search.trim() : null;

    const where = {
        ...(input.status
            ? {
                  status: input.status,
              }
            : {}),
        ...(search
            ? {
                  OR: [
                      {
                          title: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          content: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {}),
    };

    const [announcements, total] = await prisma.$transaction([
        prisma.announcement.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: pageSize,
        }),
        prisma.announcement.count({ where }),
    ]);

    return {
        items: announcements.map(mapAnnouncementToDTO),
        meta: {
            total,
            page,
            pageSize,
            hasNextPage: skip + announcements.length < total,
        },
    };
}

export async function getAnnouncementById(announcementId: string): Promise<AnnouncementDTO | null> {
    const announcement = await prisma.announcement.findUnique({
        where: {
            id: announcementId,
        },
    });

    if (!announcement) {
        return null;
    }

    return mapAnnouncementToDTO(announcement);
}

export async function listPublicAnnouncements(
    input: ListPublicAnnouncementInput,
): Promise<ListResult<AnnouncementDTO>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    const search = input.search ? input.search.trim() : null;

    const where = {
        status: "PUBLISHED" as const,
        ...(search
            ? {
                  OR: [
                      {
                          title: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          content: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {}),
    };

    const [announcements, total] = await prisma.$transaction([
        prisma.announcement.findMany({
            where,
            orderBy: [
                {
                    publishedAt: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
            skip,
            take: pageSize,
        }),
        prisma.announcement.count({ where }),
    ]);

    return {
        items: announcements.map(mapAnnouncementToDTO),
        meta: {
            total,
            page,
            pageSize,
            hasNextPage: skip + announcements.length < total,
        },
    };
}
