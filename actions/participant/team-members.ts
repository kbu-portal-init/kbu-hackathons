"use server";

import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { UpdateMemberImageData } from "@/lib/contracts/team-members";
import { updateMemberImageSchema } from "@/lib/contracts/team-members";
import { updateMemberImage as updateMemberImageService } from "@/lib/services/team-members";
import { toFieldErrors } from "@/lib/validation/zod";

export async function updateMemberImage(input: unknown): Promise<ActionResult<UpdateMemberImageData>> {
    const { team } = await requireApprovedTeam();

    const parsed = updateMemberImageSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid member image data",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return updateMemberImageService(team.id, parsed.data);
}
