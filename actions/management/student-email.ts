"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { studentEmailVerificationSchema } from "@/lib/contracts/email";
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
                code: "VALIDATION_ERROR",
                message: "Invalid team member",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    try {
        await sendStudentEmailVerification(parsed.data.teamMemberId);
    } catch (error) {
        if (error instanceof Error && error.message === "Team member not found")
            return { ok: false, error: { code: "TEAM_MEMBER_NOT_FOUND", message: "Team member not found" } };
        if (error instanceof Error && error.message === "Invalid student email domain")
            return { ok: false, error: { code: "INVALID_STUDENT_EMAIL", message: "Student email is invalid" } };
        if (error instanceof Error && error.message === "Too many verification email requests")
            return {
                ok: false,
                error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
            };
        if (isNotificationDeliveryError(error))
            return { ok: false, error: { code: "EMAIL_SEND_FAILED", message: "Unable to send verification email" } };
        return {
            ok: false,
            error: { code: "VERIFICATION_REQUEST_FAILED", message: "Unable to prepare verification email" },
        };
    }
    return { ok: true, data: { sent: true } };
}
