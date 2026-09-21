"use server";

import { z } from "zod";
import { requireApprovedTeam } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/contracts/common";
import type { TeamSubmission, TeamWorkspace } from "@/lib/contracts/team-workspace";
import { addTeamMemberSchema, updateTeamProfileSchema, upsertSubmissionSchema } from "@/lib/contracts/team-workspace";
import { getTeamWorkspace } from "@/lib/data/team-workspace";
import {
    addTeamMember,
    removeTeamMember,
    TeamWorkspaceError,
    updateTeamProfile,
    upsertSubmission,
} from "@/lib/services/team-workspace";
import { toFieldErrors } from "@/lib/validation/zod";

export async function fetchTeamWorkspace() {
    const { team } = await requireApprovedTeam();
    return getTeamWorkspace(team.id);
}

export async function saveTeamProfile(input: unknown): Promise<ActionResult<TeamWorkspace>> {
    const { team, user } = await requireApprovedTeam();
    const parsed = updateTeamProfileSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Team profile is invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await updateTeamProfile(team.id, parsed.data, user.id) };
}

export async function createTeamMember(input: unknown): Promise<ActionResult<null>> {
    const { team, user } = await requireApprovedTeam();
    const parsed = addTeamMemberSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Member details are invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    try {
        await addTeamMember(team.id, parsed.data, user.id);
        return { ok: true, data: null };
    } catch (error) {
        if (error instanceof TeamWorkspaceError) {
            return {
                ok: false,
                error: { code: error.code, message: "A member with this student email already exists" },
            };
        }
        throw error;
    }
}

export async function deleteTeamMember(input: unknown): Promise<ActionResult<null>> {
    const { team, user } = await requireApprovedTeam();
    const parsed = z.object({ memberId: z.string().min(1) }).safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid member",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    await removeTeamMember(team.id, parsed.data.memberId, user.id);
    return { ok: true, data: null };
}

export async function saveSubmission(input: unknown): Promise<ActionResult<TeamSubmission>> {
    const { team, user } = await requireApprovedTeam();
    const parsed = upsertSubmissionSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Submission is invalid",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await upsertSubmission(team.id, parsed.data, user.id) };
}
