import { z } from "zod";
import type { TeamMemberRole as PrismaTeamMemberRole } from "@/generated/prisma/enums";
import type { RegistrationStatusValue } from "@/lib/contracts/teams";

export type TeamMemberRole = PrismaTeamMemberRole;

export type TeamWorkspace = {
    id: string;
    loginName: string;
    displayName: string;
    imageUrl: string | null;
    registrationStatus: RegistrationStatusValue | null;
    memberCount: number;
    createdAt: string;
};

export type TeamMemberProfile = {
    id: string;
    name: string;
    studentEmail: string;
    role: TeamMemberRole;
    studentEmailVerified: boolean;
    createdAt: string;
};

export type TeamSubmission = {
    id: string;
    title: string;
    description: string | null;
    repositoryUrl: string | null;
    demoUrl: string | null;
    presentationUrl: string | null;
    submittedAt: string | null;
    updatedAt: string;
};

export type TeamWorkspaceView = {
    team: TeamWorkspace;
    members: TeamMemberProfile[];
    submission: TeamSubmission | null;
};

export const upsertSubmissionSchema = z
    .object({
        title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
        description: z.string().trim().max(2000).optional(),
        repositoryUrl: z.string().trim().url("Enter a valid repository URL").optional().or(z.literal("")),
        demoUrl: z.string().trim().url("Enter a valid demo URL").optional().or(z.literal("")),
        presentationUrl: z.string().trim().url("Enter a valid presentation URL").optional().or(z.literal("")),
    })
    .refine((data) => Boolean(data.title.trim()), { message: "Title is required", path: ["title"] });
export type UpsertSubmissionInput = z.infer<typeof upsertSubmissionSchema>;

export const updateTeamProfileSchema = z.object({
    displayName: z.string().trim().min(2, "Team name must be at least 2 characters").max(80),
});
export type UpdateTeamProfileInput = z.infer<typeof updateTeamProfileSchema>;

export const addTeamMemberSchema = z.object({
    name: z.string().trim().min(2, "Member name must be at least 2 characters").max(80),
    studentEmail: z.string().trim().email("Enter a valid student email"),
});
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
