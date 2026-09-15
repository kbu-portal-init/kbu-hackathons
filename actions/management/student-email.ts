"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { studentEmailVerificationSchema } from "@/lib/contracts/email";
import { sendStudentEmailVerification } from "@/lib/services/student-email-verification";

export async function requestStudentEmailVerification(input: unknown): Promise<ActionResult<{ sent: true }>> {
    await requireOrganizerOrAdmin();
    const parsed = studentEmailVerificationSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid team member",
                fieldErrors: { teamMemberId: ["Team member ID is required"] },
            },
        };
    await sendStudentEmailVerification(parsed.data.teamMemberId);
    return { ok: true, data: { sent: true } };
}
