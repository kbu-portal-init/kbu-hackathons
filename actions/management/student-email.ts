"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { studentEmailVerificationSchema } from "@/lib/contracts/email";
import { ErrorCodes } from "@/lib/contracts/errors";
import { isNotificationDeliveryError } from "@/lib/services/notifications";
import { sendStudentEmailVerification } from "@/lib/services/student-email-verification";
import { toFieldErrors } from "@/lib/validation/zod";

export async function requestStudentEmailVerification(input: unknown): Promise<ActionResult<{ sent: true }>> {
    await requireOrganizerOrAdmin();
    const parsed = studentEmailVerificationSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    try {
        await sendStudentEmailVerification(parsed.data.teamMemberId);
    } catch (err) {
        if (err instanceof Error && err.message === "Team member not found")
            return {
                ok: false,
                error: {
                    code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                    message: "Team member not found",
                },
            };
        if (err instanceof Error && err.message === "Invalid student email domain")
            return {
                ok: false,
                error: {
                    code: ErrorCodes.INVALID_STUDENT_EMAIL,
                    message: "Student email is invalid",
                },
            };
        if (isNotificationDeliveryError(err))
            return {
                ok: false,
                error: { code: ErrorCodes.EMAIL_SEND_FAILED, message: "Unable to send email" },
            };
        return {
            ok: false,
            error: {
                code: ErrorCodes.VERIFICATION_REQUEST_FAILED,
                message: "Unable to prepare verification email",
            },
        };
    }
    return { ok: true, data: { sent: true } };
}
