"use server";

import { requireAdmin } from "@/lib/auth/guards";
import type { DeleteAuditLogData } from "@/lib/contracts/audits";
import { deleteAuditLogSchema } from "@/lib/contracts/audits";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import { deleteAuditLog as deleteAuditLogService } from "@/lib/services/audits";
import { toFieldErrors } from "@/lib/validation/zod";

export async function deleteAuditLog(input: unknown): Promise<ActionResult<DeleteAuditLogData>> {
    await requireAdmin();
    const parsed = deleteAuditLogSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: ErrorMessages[ErrorCodes.VALIDATION_ERROR],
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    return deleteAuditLogService(parsed.data);
}
