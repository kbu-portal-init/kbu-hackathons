import { z } from "zod";

export const eventScheduleItemSchema = z.object({
    day: z.coerce.number().int().min(1).max(2),
    time: z.string().trim().min(1, "Time is required"),
    activity: z.string().trim().min(1, "Activity is required"),
});

export const upsertEventScheduleSchema = z.object({
    items: z.array(eventScheduleItemSchema),
});

export type UpsertEventScheduleInput = z.infer<typeof upsertEventScheduleSchema>;
export type UpsertEventScheduleData = { count: number };

export type EventScheduleItemDTO = { id: string; day: number; time: string; activity: string };
export type EventScheduleDTO = { items: EventScheduleItemDTO[] };
