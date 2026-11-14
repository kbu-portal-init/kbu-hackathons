"use server";

import { getUserRole, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { banAccountSchema, unbanAccountSchema } from "@/lib/contracts/accounts";
import type { ActionResult, ListActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type {
    CreateTeamMemberData,
    DeleteTeamMemberData,
    UpdateManagementMemberImageData,
    UpdateTeamMemberData,
} from "@/lib/contracts/team-members";

import {
    createTeamMemberSchema,
    deleteTeamMemberSchema,
    updateManagementMemberImageSchema,
    updateTeamMemberSchema,
} from "@/lib/contracts/team-members";
import type {
    ArchiveTeamData,
    TeamDetailDTO,
    TeamListItem,
    UnarchiveTeamData,
    UpdateTeamData,
} from "@/lib/contracts/teams";
import {
    archiveTeamSchema,
    listTeamsSchema,
    teamIdSchema,
    unarchiveTeamSchema,
    updateTeamSchema,
} from "@/lib/contracts/teams";
import { getTeamDetail, listTeams as listTeamsData } from "@/lib/data/teams";
import { banAccount, unbanAccount } from "@/lib/services/account-banning";
import { isNotificationDeliveryError } from "@/lib/services/notifications";
import { sendStudentEmailVerification } from "@/lib/services/student-email-verification";
import {
    archiveTeam as archiveTeamService,
    unarchiveTeam as unarchiveTeamService,
    updateTeam as updateTeamService,
} from "@/lib/services/team-management";
import {
    createTeamMember as createTeamMemberService,
    deleteTeamMember as deleteTeamMemberService,
    updateManagementMemberImage as updateManagementMemberImageService,
    updateTeamMember as updateTeamMemberService,
} from "@/lib/services/team-members";
import { toFieldErrors } from "@/lib/validation/zod";

type VerificationEmailStatus =
    | { sent: true }
    | {
          sent: false;
          error: {
              code: string;
              message: string;
          };
      };
export async function createTeamMember(
    input: unknown,
): Promise<ActionResult<CreateTeamMemberData & { verificationEmail: VerificationEmailStatus }>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = createTeamMemberSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    const result = await createTeamMemberService(parsed.data, session.user.id);

    if (!result.ok) return result;

    const verificationEmail = await requestVerificationEmail(result.data.id);

    return {
        ok: true,
        data: {
            ...result.data,
            verificationEmail,
        },
    };
}

export async function updateTeamMember(
    input: unknown,
): Promise<ActionResult<UpdateTeamMemberData & { verificationEmail: VerificationEmailStatus | null }>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = updateTeamMemberSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    const result = await updateTeamMemberService(parsed.data, session.user.id);

    if (!result.ok) return result;

    const verificationEmail = result.data.emailChanged ? await requestVerificationEmail(result.data.id) : null;

    return {
        ok: true,
        data: {
            ...result.data,
            verificationEmail,
        },
    };
}

export async function updateManagementMemberImage(
    input: unknown,
): Promise<ActionResult<UpdateManagementMemberImageData>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = updateManagementMemberImageSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member image details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return updateManagementMemberImageService(parsed.data, session.user.id);
}

export async function deleteTeamMember(input: unknown): Promise<ActionResult<DeleteTeamMemberData>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = deleteTeamMemberSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team member details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return deleteTeamMemberService(parsed.data, session.user.id);
}

async function requestVerificationEmail(teamMemberId: string): Promise<VerificationEmailStatus> {
    try {
        await sendStudentEmailVerification(teamMemberId);
        return { sent: true };
    } catch (error) {
        if (error instanceof Error && error.message === "Too many verification email requests") {
            return {
                sent: false,
                error: {
                    code: "RATE_LIMITED",
                    message: "Too many requests. Please try again later.",
                },
            };
        }

        if (error instanceof Error && error.message === "Team member not found") {
            return {
                sent: false,
                error: {
                    code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                    message: "Team member not found",
                },
            };
        }

        if (error instanceof Error && error.message === "Invalid student email domain") {
            return {
                sent: false,
                error: {
                    code: ErrorCodes.INVALID_STUDENT_EMAIL,
                    message: "Student email is invalid",
                },
            };
        }

        if (isNotificationDeliveryError(error)) {
            return {
                sent: false,
                error: {
                    code: ErrorCodes.EMAIL_SEND_FAILED,
                    message: "The verification email could not be delivered.",
                },
            };
        }

        return {
            sent: false,
            error: {
                code: ErrorCodes.VERIFICATION_REQUEST_FAILED,
                message: "Unable to prepare verification email.",
            },
        };
    }
}

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

export async function updateTeamRequest(input: unknown): Promise<ActionResult<UpdateTeamData>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = updateTeamSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Invalid team details",
                fieldErrors: toFieldErrors(parsed.error),
            },
        };
    }

    return updateTeamService(parsed.data, session.user.id);
}

export async function archiveTeamRequest(input: unknown): Promise<ActionResult<ArchiveTeamData>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = archiveTeamSchema.safeParse(input);

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

    return archiveTeamService(parsed.data, session.user.id);
}

export async function unarchiveTeamRequest(input: unknown): Promise<ActionResult<UnarchiveTeamData>> {
    const session = await requireOrganizerOrAdmin();

    const parsed = unarchiveTeamSchema.safeParse(input);

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

    return unarchiveTeamService(parsed.data, session.user.id);
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
