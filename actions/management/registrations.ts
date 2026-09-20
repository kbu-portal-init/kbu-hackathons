"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import { studentEmailVerificationSchema } from "@/lib/contracts/email";
import { ErrorCodes } from "@/lib/contracts/errors";
import type {
    ApproveRegistrationData,
    RegistrationDetailDTO,
    RegistrationListItem,
    RejectRegistrationData,
    SubmitRegistrationData,
} from "@/lib/contracts/registration";
import {
    approveRegistrationSchema,
    listRegistrationsSchema,
    registrationIdSchema,
    rejectRegistrationSchema,
    submitRegistrationSchema,
} from "@/lib/contracts/registration";
import { getRegistrationDetail, listRegistrations } from "@/lib/data/registrations";
import prisma from "@/lib/prisma";
import {
    approveRegistration as approveRegistrationService,
    rejectRegistration as rejectRegistrationService,
    submitRegistration as submitRegistrationService,
} from "@/lib/services/registration";
import { sendStudentEmailVerification } from "@/lib/services/student-email-verification";
import { toFieldErrors } from "@/lib/validation/zod";

// ── Public (no auth) ───────────────────────────────────────────────

export async function submitTeamRegistration(input: unknown): Promise<ActionResult<SubmitRegistrationData>> {
    const parsed = submitRegistrationSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid registration details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return submitRegistrationService(parsed.data);
}

// ── Management (organizer/admin) ───────────────────────────────────

export async function listRegistrationRequests(input: unknown): Promise<ListActionResult<RegistrationListItem>> {
    await requireOrganizerOrAdmin();
    const parsed = listRegistrationsSchema.safeParse(input ?? {});
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid filters",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await listRegistrations(parsed.data) };
}

export async function getRegistrationRequest(input: unknown): Promise<ActionResult<RegistrationDetailDTO>> {
    await requireOrganizerOrAdmin();
    const parsed = registrationIdSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid registration ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    const detail = await getRegistrationDetail(parsed.data.registrationId);
    return detail
        ? { ok: true, data: detail }
        : {
              ok: false,
              error: {
                  code: ErrorCodes.REGISTRATION_NOT_FOUND,
                  message: "Registration not found",
              },
          };
}

export async function approveRegistrationRequest(input: unknown): Promise<ActionResult<ApproveRegistrationData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = approveRegistrationSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid input",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return approveRegistrationService(parsed.data, session.user.id);
}

export async function rejectRegistrationRequest(input: unknown): Promise<ActionResult<RejectRegistrationData>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = rejectRegistrationSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid input",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return rejectRegistrationService(parsed.data, session.user.id);
}

export async function resendStudentEmailVerification(input: unknown): Promise<ActionResult<{ sent: boolean }>> {
    const _session = await requireOrganizerOrAdmin();
    const parsed = studentEmailVerificationSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    await sendStudentEmailVerification(parsed.data.teamMemberId);
    return { ok: true, data: { sent: true } };
}

export async function manuallyVerifyStudentEmail(input: unknown): Promise<ActionResult<{ verifiedAt: string }>> {
    const session = await requireOrganizerOrAdmin();
    const parsed = studentEmailVerificationSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    const now = new Date();
    await prisma.$transaction(async (tx) => {
        await tx.teamMember.update({
            where: { id: parsed.data.teamMemberId },
            data: { studentEmailVerifiedAt: now },
        });
        await tx.studentEmailVerification.deleteMany({
            where: { teamMemberId: parsed.data.teamMemberId, verifiedAt: null },
        });
        await tx.auditLog.create({
            data: {
                actorId: session.user.id,
                action: "STUDENT_EMAIL_MANUALLY_VERIFIED",
                targetType: "TeamMember",
                targetId: parsed.data.teamMemberId,
                details: { method: "manual" },
            },
        });
    });
    return { ok: true, data: { verifiedAt: now.toISOString() } };
}
