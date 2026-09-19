"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import type { RegistrationListItem, ReviewRegistrationData } from "@/lib/contracts/registration";
import { listRegistrationsSchema, reviewRegistrationSchema } from "@/lib/contracts/registration";
import { listRegistrations } from "@/lib/data/registration";
import { reviewRegistration as reviewRegistrationService } from "@/lib/services/registration";
import { toFieldErrors } from "@/lib/validation/zod";

export async function listPendingRegistrations(input: unknown): Promise<ListActionResult<RegistrationListItem>> {
    await requireOrganizerOrAdmin();
    const parsed = listRegistrationsSchema.safeParse(input ?? {});
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid pagination",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await listRegistrations(parsed.data) };
}

export async function reviewRegistration(input: unknown): Promise<ActionResult<ReviewRegistrationData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = reviewRegistrationSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid review decision",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return reviewRegistrationService(parsed.data, session.user.id);
}
