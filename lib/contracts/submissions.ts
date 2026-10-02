import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.url("Enter a valid URL").optional());

export const submissionSchema = z.object({
    title: z.string().trim().min(1, "Project title is required").max(120),
    summary: z.string().trim().min(1, "Project summary is required").max(500),
    problem: z.string().trim().min(1, "Problem statement is required").max(2000),
    targetUsers: z.string().trim().min(1, "Target users are required").max(500),
    solution: z.string().trim().min(1, "Solution description is required").max(3000),
    technologyStack: z.string().trim().min(1, "Technology stack is required").max(1000),
    repositoryUrl: z.url("Enter a valid repository URL"),
    demoUrl: optionalUrl,
    presentationUrl: optionalUrl,
    demoVideoUrl: optionalUrl,
    additionalNotes: z.string().trim().max(2000).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export type SubmissionDTO = {
    id: string;
    teamId: string;
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
    status: "DRAFT" | "SUBMITTED" | "REOPENED";
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
};
