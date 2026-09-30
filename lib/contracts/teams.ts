import { z } from "zod";
import type { ActionResult, ListActionResult, PageInput } from "@/lib/contracts/common";

export const listTeamsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["ACTIVE", "BANNED"]).optional(),
});

export const teamIdSchema = z.object({ teamId: z.string().min(1, "Team ID is required") });

export type ListTeamsInput = z.infer<typeof listTeamsSchema> & PageInput;

export type TeamListItem = {
    id: string;
    userId: string | null;
    displayName: string;
    loginName: string;
    imageUrl: string | null;
    memberCount: number;
    submissionCount: number;
    registrationStatus: string;
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
        description: string | null;
        repositoryUrl: string | null;
        demoUrl: string | null;
        presentationUrl: string | null;
        submittedAt: string | null;
        createdAt: string;
        updatedAt: string;
    } | null;
};

export type TeamListActionResult = ListActionResult<TeamListItem>;
export type TeamDetailActionResult = ActionResult<TeamDetailDTO>;
