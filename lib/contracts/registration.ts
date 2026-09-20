import { z } from "zod";
import type { PageInput } from "@/lib/contracts/common";

const teamMemberRoleEnum = z.enum([
    "DEVELOPER",
    "DESIGNER",
    "PRODUCT_MANAGER",
    "MARKETER",
    "PRESENTER",
    "RESEARCHER",
    "TESTER",
    "OTHER",
]);

const kbuEmail = z
    .email("Invalid email address")
    .trim()
    .toLowerCase()
    .refine((e) => e.endsWith("@ms.kbu.ac.th"), "Email must use the @ms.kbu.ac.th domain");

// ── Public submission ──────────────────────────────────────────────

export const submitRegistrationSchema = z.object({
    teamName: z.string().trim().min(2, "Team name must be at least 2 characters"),
    leaderName: z.string().trim().min(2, "Leader name must be at least 2 characters"),
    leaderEmail: kbuEmail,
    leaderRole: z.literal("LEADER").default("LEADER"),
    members: z
        .array(
            z.object({
                name: z.string().trim().min(2, "Member name must be at least 2 characters"),
                role: teamMemberRoleEnum,
                email: kbuEmail,
            }),
        )
        .min(0),
});

export type SubmitRegistrationInput = z.infer<typeof submitRegistrationSchema>;
export type SubmitRegistrationData = {
    registrationId: string;
    teamName: string;
    verificationEmailsSent: boolean;
};

// ── Management approve / reject ────────────────────────────────────

export const approveRegistrationSchema = z.object({
    registrationId: z.string().min(1, "Registration ID is required"),
});

export type ApproveRegistrationInput = z.infer<typeof approveRegistrationSchema>;
export type ApproveRegistrationData = {
    registrationId: string;
    teamLoginName: string;
    passwordSetupSent: boolean;
};

export const rejectRegistrationSchema = z.object({
    registrationId: z.string().min(1, "Registration ID is required"),
    reason: z.string().trim().min(1, "Rejection reason is required"),
});

export type RejectRegistrationInput = z.infer<typeof rejectRegistrationSchema>;
export type RejectRegistrationData = { registrationId: string };

// ── Management list / get ──────────────────────────────────────────

export const listRegistrationsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export type ListRegistrationsInput = z.infer<typeof listRegistrationsSchema> & PageInput;

export const registrationIdSchema = z.object({
    registrationId: z.string().min(1),
});

export type RegistrationIdInput = z.infer<typeof registrationIdSchema>;

// ── DTOs ───────────────────────────────────────────────────────────

export type RegistrationListItem = {
    id: string;
    teamName: string;
    loginName: string;
    status: string;
    memberCount: number;
    leaderName: string;
    leaderEmail: string;
    submittedAt: string | null;
    createdAt: string;
};

export type RegistrationMemberDTO = {
    id: string;
    name: string;
    role: string;
    email: string;
    verifiedAt: string | null;
};

export type RegistrationDetailDTO = RegistrationListItem & {
    applicationNotes: string | null;
    withdrawnAt: string | null;
    updatedAt: string;
    members: RegistrationMemberDTO[];
    reviews: {
        id: string;
        decision: string;
        reason: string | null;
        createdAt: string;
    }[];
};
