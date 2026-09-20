import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import type { UpdateTeamLogoData, UpdateTeamLogoInput } from "@/lib/contracts/team-settings";
import prisma from "@/lib/prisma";

export async function updateTeamLogo(
    teamId: string,
    input: UpdateTeamLogoInput,
): Promise<ActionResult<UpdateTeamLogoData>> {
    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { id: true },
        });

        if (!team) {
            return {
                ok: false,
                error: { code: ErrorCodes.TEAM_NOT_FOUND, message: ErrorMessages[ErrorCodes.TEAM_NOT_FOUND] },
            };
        }

        await prisma.team.update({
            where: { id: teamId },
            data: { imageUrl: input.imageUrl },
        });

        return { ok: true, data: { imageUrl: input.imageUrl } };
    } catch {
        return {
            ok: false,
            error: { code: ErrorCodes.UPDATE_FAILED, message: ErrorMessages[ErrorCodes.UPDATE_FAILED] },
        };
    }
}
