"use server";

import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import { listNotificationsSchema, type NotificationDTO, notificationIdSchema } from "@/lib/contracts/notifications";
import {
    countUnreadNotifications,
    listNotifications as listNotificationsData,
    markNotificationRead,
} from "@/lib/data/notifications";
import { toFieldErrors } from "@/lib/validation/zod";

export async function listTeamNotifications(input: unknown): Promise<ListActionResult<NotificationDTO>> {
    const session = await requireApprovedTeam();
    const parsed = listNotificationsSchema.safeParse(input ?? {});
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid notification pagination",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    return { ok: true, data: await listNotificationsData(session.user.id, parsed.data) };
}

export async function markTeamNotificationRead(input: unknown): Promise<ActionResult<{ id: string; readAt: string }>> {
    const session = await requireApprovedTeam();
    const parsed = notificationIdSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid notification",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    await markNotificationRead(session.user.id, parsed.data.notificationId);
    return { ok: true, data: { id: parsed.data.notificationId, readAt: new Date().toISOString() } };
}

export async function countTeamUnreadNotifications() {
    const session = await requireApprovedTeam();
    return countUnreadNotifications(session.user.id);
}
