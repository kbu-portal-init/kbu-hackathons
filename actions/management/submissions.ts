"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { reopenSubmission } from "@/lib/services/submissions";

export async function reopenTeamSubmission(submissionId: string): Promise<ActionResult<{ id: string }>> {
    const session = await requireOrganizerOrAdmin();
    return reopenSubmission(submissionId, session.user.id);
}
