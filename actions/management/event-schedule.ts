"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { EventScheduleDTO, UpsertEventScheduleData } from "@/lib/contracts/event-schedule";
import { upsertEventScheduleSchema } from "@/lib/contracts/event-schedule";
import { fetchEventSchedule, upsertEventSchedule as upsertEventScheduleService } from "@/lib/services/event-schedule";
import { toFieldErrors } from "@/lib/validation/zod";

export async function getEventSchedule(): Promise<ActionResult<EventScheduleDTO>> {
    await requireOrganizerOrAdmin();
    const schedule = await fetchEventSchedule();
    return { ok: true, data: schedule };
}

export async function upsertEventSchedule(input: unknown): Promise<ActionResult<UpsertEventScheduleData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = upsertEventScheduleSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid schedule",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return upsertEventScheduleService(parsed.data, session.user.id);
}
