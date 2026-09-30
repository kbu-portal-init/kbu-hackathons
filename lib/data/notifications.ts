import "server-only";

import type { ListResult } from "@/lib/contracts/common";
import type { NotificationDTO } from "@/lib/contracts/notifications";
import prisma from "@/lib/prisma";

export async function listNotifications(
    userId: string,
    input: { page: number; pageSize: number },
): Promise<ListResult<NotificationDTO>> {
    const [total, records] = await Promise.all([
        prisma.notification.count({ where: { recipientId: userId } }),
        prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
            select: { id: true, subject: true, body: true, readAt: true, createdAt: true },
        }),
    ]);

    return {
        items: records.map((record) => ({
            ...record,
            readAt: record.readAt?.toISOString() ?? null,
            createdAt: record.createdAt.toISOString(),
        })),
        meta: { total, page: input.page, pageSize: input.pageSize, hasNextPage: input.page * input.pageSize < total },
    };
}

export async function markNotificationRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
        where: { id: notificationId, recipientId: userId, readAt: null },
        data: { readAt: new Date() },
    });
}

export function countUnreadNotifications(userId: string) {
    return prisma.notification.count({ where: { recipientId: userId, readAt: null } });
}
