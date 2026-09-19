import { z } from "zod";
import type { PageInput } from "@/lib/contracts/common";

export const listTeamsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["all", "pending", "approved", "rejected"]).catch("all"),
});
export type ListTeamsInput = z.infer<typeof listTeamsSchema> & PageInput;

export type RegistrationStatusValue = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export type TeamSummary = {
    id: string;
    loginName: string;
    displayName: string;
    imageUrl: string | null;
    memberCount: number;
    registrationStatus: RegistrationStatusValue | null;
    submissionTitle: string | null;
    archived: boolean;
    createdAt: string;
};

export const teamIdSchema = z.object({ teamId: z.string().min(1) });
export type TeamIdInput = z.infer<typeof teamIdSchema>;
