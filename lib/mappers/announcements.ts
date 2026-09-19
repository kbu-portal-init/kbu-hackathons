import type { AnnouncementListItem, AnnouncementStatus, AnnouncementSummary } from "@/lib/contracts/announcements";

type AnnouncementRecord = {
    id: string;
    title: string;
    body: string;
    status: AnnouncementStatus;
    pinned: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    author: { name: string } | null;
};

export function toAnnouncementListItem(record: AnnouncementRecord): AnnouncementListItem {
    return {
        id: record.id,
        title: record.title,
        body: record.body,
        status: record.status,
        pinned: record.pinned,
        authorName: record.author?.name ?? null,
        publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
    };
}

export function toAnnouncementSummary(record: AnnouncementRecord): AnnouncementSummary {
    return {
        id: record.id,
        title: record.title,
        excerpt: record.body.length > 160 ? `${record.body.slice(0, 160).trimEnd()}…` : record.body,
        pinned: record.pinned,
        publishedAt: (record.publishedAt ?? record.createdAt).toISOString(),
    };
}
