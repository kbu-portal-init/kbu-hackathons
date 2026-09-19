import { z } from "zod";
import type { PageInput } from "@/lib/contracts/common";

export const registrationStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"]);
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>;

export const reviewDecisionSchema = z.enum(["APPROVED", "REJECTED", "REOPENED"]);
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export const listRegistrationsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: registrationStatusSchema.catch("PENDING"),
});
export type ListRegistrationsInput = z.infer<typeof listRegistrationsSchema> & PageInput;

export type RegistrationListItem = {
    id: string;
    teamId: string;
    teamName: string;
    loginName: string;
    memberCount: number;
    status: RegistrationStatus;
    applicationNotes: string | null;
    submittedAt: string | null;
    withdrawnAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export const reviewRegistrationSchema = z.object({
    registrationId: z.string().min(1),
    decision: reviewDecisionSchema,
    reason: z.string().trim().optional(),
});
export type ReviewRegistrationInput = z.infer<typeof reviewRegistrationSchema>;

export type ReviewRegistrationData = { registrationId: string };
