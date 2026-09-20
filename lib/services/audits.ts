import "server-only";
import type { DeleteAuditLogData, DeleteAuditLogInput } from "@/lib/contracts/audits";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import prisma from "@/lib/prisma";
export async function deleteAuditLog(input: DeleteAuditLogInput): Promise<ActionResult<DeleteAuditLogData>> {
    const result = await prisma.auditLog.deleteMany({ where: { id: input.id } });
    return result.count === 0
        ? {
              ok: false,
              error: { code: ErrorCodes.AUDIT_LOG_NOT_FOUND, message: ErrorMessages[ErrorCodes.AUDIT_LOG_NOT_FOUND] },
          }
        : { ok: true, data: { id: input.id } };
}
