"use server";

import { requireAdmin } from "@/lib/auth/guards";
import type { AuditLogListItem } from "@/lib/contracts/audit";
import { listAuditLogsSchema } from "@/lib/contracts/audit";
import type { ListActionResult } from "@/lib/contracts/common";
import { listAuditLogs } from "@/lib/data/audit";
import { toFieldErrors } from "@/lib/validation/zod";

export async function listAuditLogEntries(input: unknown): Promise<ListActionResult<AuditLogListItem>> {
    await requireAdmin();
    const parsed = listAuditLogsSchema.safeParse(input ?? {});
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid audit log filters",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await listAuditLogs(parsed.data) };
}
