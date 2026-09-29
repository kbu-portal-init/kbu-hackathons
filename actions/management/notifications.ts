"use server";

import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import { sendNotificationSchema } from "@/lib/contracts/notifications";
import {
    isNotificationDeliveryError,
    NotificationTargetNotFoundError,
    sendManualNotification,
} from "@/lib/services/notifications";
import { toFieldErrors } from "@/lib/validation/zod";

export async function sendManualNotificationAction(input: unknown): Promise<
    ActionResult<{
        sent: true;
        channel: "EMAIL" | "IN_APP" | "BOTH";
        emailRecipientCount: number;
        inAppRecipientCount: number;
    }>
> {
    const session = await requireOrganizerOrAdmin();
    if (!getUserRole(session.user.role))
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "You cannot send notifications" } };
    const parsed = sendNotificationSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid notification",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    try {
        return { ok: true, data: await sendManualNotification({ ...parsed.data, actorId: session.user.id }) };
    } catch (error) {
        if (error instanceof NotificationTargetNotFoundError)
            return { ok: false, error: { code: ErrorCodes.NOTIFICATION_TARGET_INVALID, message: error.message } };
        if (isNotificationDeliveryError(error))
            return {
                ok: false,
                error: { code: ErrorCodes.EMAIL_SEND_FAILED, message: "The notification could not be delivered." },
            };
        throw error;
    }
}
