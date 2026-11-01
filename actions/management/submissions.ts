"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { reopenSubmission } from "@/lib/services/submissions";

export async function reopenTeamSubmission(submissionId: string): Promise<ActionResult<{ id: string }>> {
    const session = await requireOrganizerOrAdmin();
    const result = await reopenSubmission(submissionId, session.user.id);
    if (result.ok) revalidatePath("/team");
    return result;
}
