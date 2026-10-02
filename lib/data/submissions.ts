import "server-only";

import type { SubmissionDTO } from "@/lib/contracts/submissions";
import prisma from "@/lib/prisma";

export async function getTeamSubmission(teamId: string): Promise<SubmissionDTO | null> {
    const submission = await prisma.submission.findUnique({ where: { teamId } });
    if (!submission) return null;
    return {
        ...submission,
        submittedAt: submission.submittedAt?.toISOString() ?? null,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
    };
}
