"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { UpdateTeamLogoData } from "@/lib/contracts/team-settings";
import { updateTeamLogoSchema } from "@/lib/contracts/team-settings";
import { updateTeamLogo as updateTeamLogoService } from "@/lib/services/team-settings";
import { toFieldErrors } from "@/lib/validation/zod";

export async function updateTeamLogo(input: unknown): Promise<ActionResult<UpdateTeamLogoData>> {
    const { team } = await requireApprovedTeam();

    const parsed = updateTeamLogoSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid logo data",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    const result = await updateTeamLogoService(team.id, parsed.data);
    if (result.ok) revalidatePath("/team/settings");
    return result;
}
