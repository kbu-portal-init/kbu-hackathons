import { z } from "zod";
import { studentEmailSchema } from "@/lib/contracts/email";

export const teamMemberRoleSchema = z.enum([
    "LEADER",
    "DEVELOPER",
    "DESIGNER",
    "PRODUCT_MANAGER",
    "MARKETER",
    "PRESENTER",
    "RESEARCHER",
    "TESTER",
    "OTHER",
]);

const teamMemberNameSchema = z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .refine((name) => !/[<>]/.test(name), "Name cannot contain < or >")
    .refine(
        (name) =>
            ![...name].some((character) => {
                const code = character.charCodeAt(0);
                return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
            }),
        "Name cannot contain control characters",
    );

export const createTeamMemberSchema = z.object({
    teamId: z.string().min(1),
    name: teamMemberNameSchema,
    studentEmail: studentEmailSchema,
    role: teamMemberRoleSchema,
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

export type CreateTeamMemberData = {
    id: string;
    name: string;
    studentEmail: string;
    role: TeamMemberRole;
};

export const updateTeamMemberSchema = z.object({
    teamId: z.string().min(1),
    memberId: z.string().min(1),
    name: teamMemberNameSchema,
    studentEmail: studentEmailSchema,
    role: teamMemberRoleSchema,
});

export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

export type UpdateTeamMemberData = {
    id: string;
    name: string;
    studentEmail: string;
    role: TeamMemberRole;
    studentEmailVerifiedAt: Date | null;
    emailChanged: boolean;
};

export const deleteTeamMemberSchema = z.object({
    teamId: z.string().min(1),
    memberId: z.string().min(1),
});

export type DeleteTeamMemberInput = z.infer<typeof deleteTeamMemberSchema>;

export type DeleteTeamMemberData = {
    id: string;
    cardCleanupFailed: boolean;
};

export const updateMemberImageSchema = z.object({
    memberId: z.string().min(1),
    imageUrl: z.url("Invalid URL").nullable(),
});

export type UpdateMemberImageInput = z.infer<typeof updateMemberImageSchema>;

export type UpdateMemberImageData = { imageUrl: string | null };

export const generateMemberCardSchema = z.object({
    memberId: z.string().min(1),
});

export type GenerateMemberCardInput = z.infer<typeof generateMemberCardSchema>;

export type TeamMemberCard = {
    id: string;
    name: string;
    role: string;
    studentEmail: string;
    imageUrl: string | null;
    cardUrl: string | null;
    cardShareToken: string | null;
};

export const updateManagementMemberImageSchema = z.object({
    teamId: z.string().min(1, "Team ID is required"),
    memberId: z.string().min(1, "Member ID is required"),
    imageUrl: z.url("Invalid URL").nullable(),
});

export type UpdateManagementMemberImageInput = z.infer<typeof updateManagementMemberImageSchema>;

export type UpdateManagementMemberImageData = {
    imageUrl: string | null;
};

export type GenerateMemberCardData = Pick<TeamMemberCard, "id" | "cardUrl" | "cardShareToken">;
export type TeamMemberRole = z.infer<typeof teamMemberRoleSchema>;
