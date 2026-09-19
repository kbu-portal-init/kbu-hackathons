import { z } from "zod";
import type { PageInput } from "@/lib/contracts/common";

export type AuditLogListItem = {
    id: string;
    actor: { id: string; name: string; email: string; role: string } | null;
    action: string;
    targetType: string;
    targetId: string;
    details: unknown;
    createdAt: string;
};

export const listAuditLogsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    userId: z.string().trim().optional(),
    userKind: z.enum(["user", "teamMember"]).optional(),
    action: z.string().trim().max(100).optional(),
});

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema> & PageInput;
export const deleteAuditLogSchema = z.object({ id: z.string().min(1) });
export type DeleteAuditLogInput = z.infer<typeof deleteAuditLogSchema>;
export type DeleteAuditLogData = { id: string };
