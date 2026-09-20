"use server";

import type { ActionResult } from "@/lib/contracts/common";
import { verifyTeamMemberEmail as verifyTeamMemberEmailService } from "@/lib/services/registration";

export async function verifyTeamMemberEmail(
    token: string,
): Promise<ActionResult<{ verified: boolean; allVerified: boolean; alreadyVerified: boolean }>> {
    return verifyTeamMemberEmailService(token);
}
