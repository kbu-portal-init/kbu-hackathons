import { z } from "zod";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";

export const notificationChannels = ["EMAIL", "IN_APP", "BOTH"] as const;
export const notificationChannelSchema = z.enum(notificationChannels);

export const notificationTargetSchema = z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("TEAM"), teamId: z.string().min(1, "Choose a team") }),
    z.object({ mode: z.literal("ALL_TEAMS") }),
    z.object({ mode: z.literal("EMAIL"), email: z.string().trim().toLowerCase().email("Enter a valid email") }),
]);

export const sendNotificationSchema = z.object({
    channel: notificationChannelSchema,
    subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
    body: z.string().trim().min(1, "Message is required").max(10000, "Message is too long"),
    target: notificationTargetSchema,
});

export const listNotificationsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const notificationIdSchema = z.object({ notificationId: z.string().min(1) });

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type NotificationDTO = {
    id: string;
    subject: string;
    body: string;
    readAt: string | null;
    createdAt: string;
};
export type NotificationListActionResult = ListActionResult<NotificationDTO>;
export type NotificationReadActionResult = ActionResult<{ id: string; readAt: string }>;
