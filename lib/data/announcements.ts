import "server-only";

import type {
    AnnouncementListItem,
    AnnouncementStatus,
    AnnouncementSummary,
    ListAnnouncementsInput,
} from "@/lib/contracts/announcements";
import type { ListResult } from "@/lib/contracts/common";
import { toAnnouncementListItem, toAnnouncementSummary } from "@/lib/mappers/announcements";
import prisma from "@/lib/prisma";

export async function listAnnouncements(input: ListAnnouncementsInput): Promise<ListResult<AnnouncementListItem>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const where = input.status ? { status: input.status } : {};

    const [total, records] = await Promise.all([
        prisma.announcement.count({ where }),
        prisma.announcement.findMany({
            where,
            orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { author: { select: { name: true } } },
        }),
    ]);

    return {
        items: records.map(toAnnouncementListItem),
        meta: {
            total,
            page,
            pageSize,
            hasNextPage: page * pageSize < total,
        },
    };
}

export async function listPublishedAnnouncementSummaries(
    input: ListAnnouncementsInput,
): Promise<ListResult<AnnouncementSummary>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const where = { status: "PUBLISHED" as AnnouncementStatus };

    const [total, records] = await Promise.all([
        prisma.announcement.count({ where }),
        prisma.announcement.findMany({
            where,
            orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { author: { select: { name: true } } },
        }),
    ]);

    return {
        items: records.map(toAnnouncementSummary),
        meta: {
            total,
            page,
            pageSize,
            hasNextPage: page * pageSize < total,
        },
    };
}

export async function getPublishedAnnouncement(id: string): Promise<AnnouncementListItem | null> {
    const record = await prisma.announcement.findFirst({
        where: { id, status: "PUBLISHED" },
        include: { author: { select: { name: true } } },
    });
    return record ? toAnnouncementListItem(record) : null;
}
