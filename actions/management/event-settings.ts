"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import type { EventSettingsDTO, UpsertEventSettingsData } from "@/lib/contracts/event-settings";
import { upsertEventSettingsSchema } from "@/lib/contracts/event-settings";
import { fetchEventSettings, upsertEventSettings as upsertEventSettingsService } from "@/lib/services/event-settings";
import { toFieldErrors } from "@/lib/validation/zod";

export async function getEventSettings(): Promise<ActionResult<EventSettingsDTO | null>> {
    await requireOrganizerOrAdmin();
    const settings = await fetchEventSettings();
    return { ok: true, data: settings };
}

export async function upsertEventSettings(input: unknown): Promise<ActionResult<UpsertEventSettingsData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = upsertEventSettingsSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid event settings",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return upsertEventSettingsService(parsed.data, session.user.id);
}
