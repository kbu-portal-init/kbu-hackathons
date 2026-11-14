import { z } from "zod";
import type { ActionResult, ListActionResult, PageInput } from "@/lib/contracts/common";
import { type EducationProgram, educationProgramSchema } from "@/lib/contracts/registration";

export const listTeamsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["ACTIVE", "BANNED", "ARCHIVED"]).optional(),
});

export const teamIdSchema = z.object({ teamId: z.string().min(1, "Team ID is required") });

export type ListTeamsInput = z.infer<typeof listTeamsSchema> & PageInput;

export type TeamListItem = {
    id: string;
    userId: string | null;
    displayName: string;
    loginName: string;
    imageUrl: string | null;
    program: EducationProgram;
    memberCount: number;
    submissionCount: number;
    registrationStatus: string;
    archivedAt: string | null;
    banned: boolean;
    banReason: string | null;
    banExpires: string | null;
    createdAt: string;
};

export type TeamDetailDTO = TeamListItem & {
    updatedAt: string;
    submittedAt: string | null;
    applicationNotes: string | null;
    withdrawnAt: string | null;
    members: {
        id: string;
        name: string;
        email: string;
        role: string;
        imageUrl: string | null;
        verifiedAt: string | null;
    }[];
    reviews: {
        id: string;
        decision: string;
        reason: string | null;
        createdAt: string;
    }[];
    submission: {
        id: string;
        title: string;
        summary: string;
        problem: string;
        targetUsers: string;
        solution: string;
        technologyStack: string;
        repositoryUrl: string;
        demoUrl: string | null;
        presentationUrl: string | null;
        demoVideoUrl: string | null;
        additionalNotes: string | null;
        status: string;
        submittedAt: string | null;
        createdAt: string;
        updatedAt: string;
    } | null;
};

// ── Management Team CRUD ───────────────────────────────────────────

const teamDisplayNameSchema = z
    .string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(100, "Team name must be at most 100 characters")
    .refine(
        (value) =>
            !/[<>]/.test(value) &&
            [...value].every((character) => {
                const codePoint = character.codePointAt(0) ?? 0;
                return codePoint > 0x1f && codePoint !== 0x7f;
            }),
        "Team name contains invalid characters",
    );

export const updateTeamSchema = z
    .object({
        teamId: z.string().min(1, "Team ID is required"),
        displayName: teamDisplayNameSchema.optional(),
        program: educationProgramSchema.optional(),
    })
    .refine((input) => input.displayName !== undefined || input.program !== undefined, {
        message: "At least one field must be provided",
    });

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export type UpdateTeamData = {
    teamId: string;
    displayName: string;
    program: EducationProgram;
};

export const archiveTeamSchema = teamIdSchema;
export const unarchiveTeamSchema = teamIdSchema;

export type ArchiveTeamInput = z.infer<typeof archiveTeamSchema>;
export type UnarchiveTeamInput = z.infer<typeof unarchiveTeamSchema>;

export type ArchiveTeamData = {
    teamId: string;
    archivedAt: string;
};

export type UnarchiveTeamData = {
    teamId: string;
    archivedAt: null;
};

export type TeamListActionResult = ListActionResult<TeamListItem>;
export type TeamDetailActionResult = ActionResult<TeamDetailDTO>;
