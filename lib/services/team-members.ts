import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import type { UpdateMemberImageData, UpdateMemberImageInput } from "@/lib/contracts/team-members";
import prisma from "@/lib/prisma";

export async function updateMemberImage(
    teamId: string,
    input: UpdateMemberImageInput,
): Promise<ActionResult<UpdateMemberImageData>> {
    try {
        const member = await prisma.teamMember.findFirst({
            where: { id: input.memberId, teamId },
            select: { id: true },
        });

        if (!member) {
            return {
                ok: false,
                error: { code: "MEMBER_NOT_FOUND", message: "Team member not found" },
            };
        }

        await prisma.teamMember.update({
            where: { id: input.memberId },
            data: { imageUrl: input.imageUrl },
        });

        return { ok: true, data: { imageUrl: input.imageUrl } };
    } catch {
        return {
            ok: false,
            error: { code: "UPDATE_FAILED", message: "Failed to update member image" },
        };
    }
}
