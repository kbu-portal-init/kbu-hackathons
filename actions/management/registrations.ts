"use server";

import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import { studentEmailVerificationSchema } from "@/lib/contracts/email";
import { ErrorCodes } from "@/lib/contracts/errors";
import type {
    ApproveRegistrationData,
    CreateManagementRegistrationData,
    DeleteRegistrationData,
    RegistrationDetailDTO,
    RegistrationListItem,
    RejectRegistrationData,
    SubmitRegistrationData,
    UpdateRegistrationData,
} from "@/lib/contracts/registration";
import {
    approveRegistrationSchema,
    createManagementRegistrationSchema,
    deleteRegistrationSchema,
    listRegistrationsSchema,
    registrationIdSchema,
    rejectRegistrationSchema,
    submitRegistrationSchema,
    updateRegistrationSchema,
} from "@/lib/contracts/registration";
import { getRegistrationDetail, listRegistrations } from "@/lib/data/registrations";
import prisma from "@/lib/prisma";
import {
    approveRegistration as approveRegistrationService,
    createManagementRegistration as createManagementRegistrationService,
    deleteRegistration as deleteRegistrationService,
    rejectRegistration as rejectRegistrationService,
    submitRegistration as submitRegistrationService,
    updateRegistration as updateRegistrationService,
} from "@/lib/services/registration";
import { sendStudentEmailVerification } from "@/lib/services/student-email-verification";
import { toFieldErrors } from "@/lib/validation/zod";

// ── Public (no auth) ───────────────────────────────────────────────

export async function submitTeamRegistration(input: unknown): Promise<ActionResult<SubmitRegistrationData>> {
    try {
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
        return await submitRegistrationService(parsed.data);
    } catch (error) {
        console.error("submitTeamRegistration failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.CREATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

// ── Management (organizer/admin) ───────────────────────────────────

export async function createRegistrationRequest(
    input: unknown,
): Promise<ActionResult<CreateManagementRegistrationData>> {
    const session = await requireOrganizerOrAdmin();

    try {
        const parsed = createManagementRegistrationSchema.safeParse(input);

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

        return await createManagementRegistrationService(parsed.data, session.user.id);
    } catch (error) {
        console.error("createRegistrationRequest failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.CREATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function updateRegistrationRequest(input: unknown): Promise<ActionResult<UpdateRegistrationData>> {
    const session = await requireOrganizerOrAdmin();

    try {
        const parsed = updateRegistrationSchema.safeParse(input);

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

        return await updateRegistrationService(parsed.data, session.user.id);
    } catch (error) {
        console.error("updateRegistrationRequest failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function deleteRegistrationRequest(input: unknown): Promise<ActionResult<DeleteRegistrationData>> {
    const session = await requireOrganizerOrAdmin();

    try {
        const parsed = deleteRegistrationSchema.safeParse(input);

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

        return await deleteRegistrationService(parsed.data, session.user.id);
    } catch (error) {
        console.error("deleteRegistrationRequest failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.DELETE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function listRegistrationRequests(input: unknown): Promise<ListActionResult<RegistrationListItem>> {
    await requireOrganizerOrAdmin();
    try {
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
    } catch (error) {
        console.error("listRegistrationRequests failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function getRegistrationRequest(input: unknown): Promise<ActionResult<RegistrationDetailDTO>> {
    await requireOrganizerOrAdmin();
    try {
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
    } catch (error) {
        console.error("getRegistrationRequest failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function approveRegistrationRequest(input: unknown): Promise<ActionResult<ApproveRegistrationData>> {
    const session = await requireOrganizerOrAdmin();
    try {
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
        return await approveRegistrationService(parsed.data, session.user.id);
    } catch (error) {
        console.error("approveRegistrationRequest failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.APPROVAL_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function rejectRegistrationRequest(input: unknown): Promise<ActionResult<RejectRegistrationData>> {
    const session = await requireOrganizerOrAdmin();
    try {
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
        return await rejectRegistrationService(parsed.data, session.user.id);
    } catch (error) {
        console.error("rejectRegistrationRequest failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function resendStudentEmailVerification(input: unknown): Promise<ActionResult<{ sent: boolean }>> {
    const _session = await requireOrganizerOrAdmin();
    try {
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
        try {
            await sendStudentEmailVerification(parsed.data.teamMemberId);
        } catch (error) {
            if (error instanceof Error && error.message === "Too many verification email requests") {
                return {
                    ok: false,
                    error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
                };
            }
            throw error;
        }
        return { ok: true, data: { sent: true } };
    } catch (error) {
        console.error("resendStudentEmailVerification failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.VERIFICATION_REQUEST_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}

export async function manuallyVerifyStudentEmail(input: unknown): Promise<ActionResult<{ verifiedAt: string }>> {
    const session = await requireOrganizerOrAdmin();
    try {
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
    } catch (error) {
        console.error("manuallyVerifyStudentEmail failed", error);
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Unable to complete registration request. Please try again.",
            },
        };
    }
}
