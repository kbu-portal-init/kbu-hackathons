import { z } from "zod";
import type { PageInput } from "@/lib/contracts/common";

export const auditActionSchema = z.string().trim().min(1, "Action is required");

export const listAuditLogsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    action: auditActionSchema.optional(),
    targetType: z.string().trim().optional(),
    actorId: z.string().min(1).optional(),
});
export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema> & PageInput;

export type AuditLogListItem = {
    id: string;
    actorId: string | null;
    actorName: string | null;
    action: string;
    targetType: string;
    targetId: string;
    details: string | null;
    createdAt: string;
};
