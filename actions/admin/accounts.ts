"use server";

import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { AccountActionData } from "@/lib/contracts/accounts";
import { banAccountSchema, unbanAccountSchema } from "@/lib/contracts/accounts";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import { banAccount as banAccountService, unbanAccount as unbanAccountService } from "@/lib/services/account-banning";
import { toFieldErrors } from "@/lib/validation/zod";

export async function banAccount(input: unknown): Promise<ActionResult<AccountActionData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = banAccountSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: ErrorMessages[ErrorCodes.VALIDATION_ERROR],
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    const actorRole = getUserRole(session.user.role);
    if (actorRole !== "organizer" && actorRole !== "admin") {
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "You cannot manage account bans" } };
    }
    return banAccountService(parsed.data, actorRole, session.user.id);
}

export async function unbanAccount(input: unknown): Promise<ActionResult<AccountActionData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = unbanAccountSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: ErrorMessages[ErrorCodes.VALIDATION_ERROR],
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    const actorRole = getUserRole(session.user.role);
    if (actorRole !== "organizer" && actorRole !== "admin") {
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "You cannot manage account bans" } };
    }
    return unbanAccountService(parsed.data, actorRole, session.user.id);
}
