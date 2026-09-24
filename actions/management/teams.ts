"use server";

import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { banAccountSchema, unbanAccountSchema } from "@/lib/contracts/accounts";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { TeamDetailDTO, TeamListItem } from "@/lib/contracts/teams";
import { listTeamsSchema, teamIdSchema } from "@/lib/contracts/teams";
import { getTeamDetail, listTeams as listTeamsData } from "@/lib/data/teams";
import { banAccount, unbanAccount } from "@/lib/services/account-banning";
import { toFieldErrors } from "@/lib/validation/zod";

export async function listTeams(input: unknown): Promise<ListActionResult<TeamListItem>> {
    await requireOrganizerOrAdmin();
    const parsed = listTeamsSchema.safeParse(input ?? {});
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team filters",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    return { ok: true, data: await listTeamsData(parsed.data) };
}

export async function getTeam(input: unknown): Promise<ActionResult<TeamDetailDTO>> {
    await requireOrganizerOrAdmin();
    const parsed = teamIdSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team ID",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }
    const team = await getTeamDetail(parsed.data.teamId);
    return team
        ? { ok: true, data: team }
        : { ok: false, error: { code: ErrorCodes.TEAM_NOT_FOUND, message: "Team not found" } };
}

export async function banTeam(input: unknown): Promise<ActionResult<{ userId: string }>> {
    const session = await requireOrganizerOrAdmin();
    const actorRole = getUserRole(session.user.role);
    if (actorRole !== "organizer" && actorRole !== "admin")
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "You cannot manage team bans" } };
    const parsed = banAccountSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid ban details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    return banAccount(parsed.data, actorRole, session.user.id);
}

export async function unbanTeam(input: unknown): Promise<ActionResult<{ userId: string }>> {
    const session = await requireOrganizerOrAdmin();
    const actorRole = getUserRole(session.user.role);
    if (actorRole !== "organizer" && actorRole !== "admin")
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "You cannot manage team bans" } };
    const parsed = unbanAccountSchema.safeParse(input);
    if (!parsed.success)
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team account",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    return unbanAccount(parsed.data, actorRole, session.user.id);
}
