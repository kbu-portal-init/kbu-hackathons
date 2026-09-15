"use server";

import { requireAdmin } from "@/lib/auth/guards";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import type { OrganizerListItem } from "@/lib/contracts/organizers";
import {
    type CreateOrganizerData,
    createOrganizerSchema,
    listOrganizersSchema,
    organizerIdSchema,
    updateOrganizerSchema,
} from "@/lib/contracts/organizers";
import { getOrganizer, listOrganizers } from "@/lib/data/organizers";
import { provisionOrganizer, updateOrganizer as updateOrganizerService } from "@/lib/services/organizer-provisioning";

export async function createOrganizer(input: unknown): Promise<ActionResult<CreateOrganizerData>> {
    await requireAdmin();
    const parsed = createOrganizerSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid organizer details",
                fieldErrors: Object.fromEntries(
                    parsed.error.issues.map((issue) => [issue.path.join("."), [issue.message]]),
                ),
            },
        };
    }
    return provisionOrganizer(parsed.data);
}

export async function updateOrganizer(input: unknown): Promise<ActionResult<CreateOrganizerData>> {
    await requireAdmin();
    const parsed = updateOrganizerSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Some fields are invalid",
                fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), [i.message]])),
            },
        };
    return updateOrganizerService(parsed.data);
}

export async function listOrganizerAccounts(input: unknown): Promise<ListActionResult<OrganizerListItem>> {
    await requireAdmin();
    const parsed = listOrganizersSchema.safeParse(input ?? {});
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid pagination",
                fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), [i.message]])),
            },
        };
    return { ok: true, data: await listOrganizers(parsed.data) };
}

export async function getOrganizerAccount(input: unknown): Promise<ActionResult<OrganizerListItem>> {
    await requireAdmin();
    const parsed = organizerIdSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid organizer ID",
                fieldErrors: { userId: ["User ID is required"] },
            },
        };
    const organizer = await getOrganizer(parsed.data.userId);
    return organizer
        ? { ok: true, data: organizer }
        : { ok: false, error: { code: "ORGANIZER_NOT_FOUND", message: "Organizer not found" } };
}
