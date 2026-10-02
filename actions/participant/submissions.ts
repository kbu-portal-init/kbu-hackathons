"use server";

import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import { type SubmissionDTO, submissionSchema } from "@/lib/contracts/submissions";
import { saveTeamSubmission } from "@/lib/services/submissions";
import { toFieldErrors } from "@/lib/validation/zod";

export async function saveSubmission(input: unknown, finalize = false): Promise<ActionResult<SubmissionDTO>> {
    const session = await requireApprovedTeam();
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid submission",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    return saveTeamSubmission(session.team.id, parsed.data, finalize, session.user.id);
}
