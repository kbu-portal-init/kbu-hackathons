"use server";

import { requireAdmin } from "@/lib/auth/guards";
import type { DeleteAuditLogData } from "@/lib/contracts/audits";
import { deleteAuditLogSchema } from "@/lib/contracts/audits";
import type { ActionResult } from "@/lib/contracts/common";
import { deleteAuditLog as deleteAuditLogService } from "@/lib/services/audits";
import { toFieldErrors } from "@/lib/validation/zod";

export async function deleteAuditLog(input: unknown): Promise<ActionResult<DeleteAuditLogData>> {
    await requireAdmin();
    const parsed = deleteAuditLogSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Some fields are invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    return deleteAuditLogService(parsed.data);
}
