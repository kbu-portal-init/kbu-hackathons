"use server";

import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import type { GenerateMemberCardData } from "@/lib/contracts/team-members";
import { generateMemberCardSchema } from "@/lib/contracts/team-members";
import { generateMemberCard as generateMemberCardService } from "@/lib/services/member-cards";
import { toFieldErrors } from "@/lib/validation/zod";

export async function generateMemberCard(input: unknown): Promise<ActionResult<GenerateMemberCardData>> {
    const { team } = await requireApprovedTeam();
    const parsed = generateMemberCardSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid member card data",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return generateMemberCardService(team.id, parsed.data);
}
