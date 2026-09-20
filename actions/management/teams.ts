"use server";

import { z } from "zod";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import { resetTeamPassword, setTeamPassword } from "@/lib/services/team-password";
import { toFieldErrors } from "@/lib/validation/zod";

const setTeamPasswordSchema = z.object({
    teamId: z.string().min(1, "Team ID is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const resetTeamPasswordSchema = z.object({
    teamId: z.string().min(1, "Team ID is required"),
});

export async function setTeamPasswordAction(input: unknown): Promise<ActionResult<{ sent: boolean }>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = setTeamPasswordSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid input",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return setTeamPassword(parsed.data.teamId, parsed.data.password, session.user.id);
}

export async function resetTeamPasswordAction(input: unknown): Promise<ActionResult<{ sent: boolean }>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = resetTeamPasswordSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid input",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return resetTeamPassword(parsed.data.teamId, session.user.id);
}
