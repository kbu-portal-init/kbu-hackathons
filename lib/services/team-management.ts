import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { EducationProgram } from "@/lib/contracts/registration";
import type {
    ArchiveTeamData,
    ArchiveTeamInput,
    UnarchiveTeamData,
    UnarchiveTeamInput,
    UpdateTeamData,
    UpdateTeamInput,
} from "@/lib/contracts/teams";
import prisma from "@/lib/prisma";

type ProgramQuotaSettings = {
    maxThaiTeams: number;
    maxInternationalTeams: number;
};

function programQuotaLimit(settings: ProgramQuotaSettings, program: EducationProgram): number {
    return program === "THAI_PROGRAM" ? settings.maxThaiTeams : settings.maxInternationalTeams;
}

function programQuotaMessage(program: EducationProgram): string {
    return `${program === "THAI_PROGRAM" ? "Thai program" : "International program"} quota has been reached`;
}

export async function updateTeam(input: UpdateTeamInput, actorId: string): Promise<ActionResult<UpdateTeamData>> {
    try {
        return await prisma.$transaction(async (tx) => {
            // Maintain the same lock order as registration approval.
            await tx.$queryRaw`
                SELECT id FROM "event_settings" WHERE id = 1 FOR UPDATE
            `;

            await tx.$queryRaw`
                SELECT id FROM "registration" WHERE "teamId" = ${input.teamId} FOR UPDATE
            `;

            await tx.$queryRaw`
                SELECT id FROM "team" WHERE id = ${input.teamId} FOR UPDATE
            `;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: {
                    id: true,
                    displayName: true,
                    program: true,
                    registration: {
                        select: { status: true },
                    },
                },
            });

            if (!team) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.TEAM_NOT_FOUND,
                        message: "Team not found",
                    },
                };
            }

            const nextDisplayName = input.displayName ?? team.displayName;
            const nextProgram = input.program ?? team.program;
            const programChanged = nextProgram !== team.program;

            if (programChanged && team.registration?.status === "APPROVED") {
                const settings = await tx.eventSettings.findUnique({
                    where: { id: 1 },
                    select: {
                        maxThaiTeams: true,
                        maxInternationalTeams: true,
                    },
                });

                if (!settings) {
                    return {
                        ok: false as const,
                        error: {
                            code: ErrorCodes.EVENT_NOT_CONFIGURED,
                            message: "Event settings are not configured",
                        },
                    };
                }

                const approvedCount = await tx.registration.count({
                    where: {
                        status: "APPROVED",
                        team: { is: { program: nextProgram } },
                    },
                });

                if (approvedCount >= programQuotaLimit(settings, nextProgram)) {
                    return {
                        ok: false as const,
                        error: {
                            code: ErrorCodes.MAX_TEAMS_REACHED,
                            message: programQuotaMessage(nextProgram),
                        },
                    };
                }
            }

            const updatedTeam = await tx.team.update({
                where: { id: input.teamId },
                data: {
                    displayName: nextDisplayName,
                    program: nextProgram,
                },
                select: {
                    id: true,
                    displayName: true,
                    program: true,
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_UPDATED",
                    targetType: "Team",
                    targetId: team.id,
                    details: {
                        previous: {
                            displayName: team.displayName,
                            program: team.program,
                        },
                        updated: {
                            displayName: updatedTeam.displayName,
                            program: updatedTeam.program,
                        },
                    },
                },
            });

            return {
                ok: true as const,
                data: {
                    teamId: updatedTeam.id,
                    displayName: updatedTeam.displayName,
                    program: updatedTeam.program,
                },
            };
        });
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Failed to update team",
            },
        };
    }
}

export async function archiveTeam(input: ArchiveTeamInput, actorId: string): Promise<ActionResult<ArchiveTeamData>> {
    try {
        return await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
                SELECT id FROM "team" WHERE id = ${input.teamId} FOR UPDATE
            `;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: { id: true, archivedAt: true },
            });

            if (!team) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.TEAM_NOT_FOUND,
                        message: "Team not found",
                    },
                };
            }

            if (team.archivedAt) {
                return {
                    ok: true as const,
                    data: {
                        teamId: team.id,
                        archivedAt: team.archivedAt.toISOString(),
                    },
                };
            }

            const archivedAt = new Date();

            await tx.team.update({
                where: { id: team.id },
                data: { archivedAt },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_ARCHIVED",
                    targetType: "Team",
                    targetId: team.id,
                    details: {
                        previousArchivedAt: null,
                        archivedAt: archivedAt.toISOString(),
                    },
                },
            });

            return {
                ok: true as const,
                data: {
                    teamId: team.id,
                    archivedAt: archivedAt.toISOString(),
                },
            };
        });
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Failed to archive team",
            },
        };
    }
}

export async function unarchiveTeam(
    input: UnarchiveTeamInput,
    actorId: string,
): Promise<ActionResult<UnarchiveTeamData>> {
    try {
        return await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
                SELECT id FROM "team" WHERE id = ${input.teamId} FOR UPDATE
            `;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: { id: true, archivedAt: true },
            });

            if (!team) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.TEAM_NOT_FOUND,
                        message: "Team not found",
                    },
                };
            }

            if (!team.archivedAt) {
                return {
                    ok: true as const,
                    data: {
                        teamId: team.id,
                        archivedAt: null,
                    },
                };
            }

            await tx.team.update({
                where: { id: team.id },
                data: { archivedAt: null },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_UNARCHIVED",
                    targetType: "Team",
                    targetId: team.id,
                    details: {
                        previousArchivedAt: team.archivedAt.toISOString(),
                        archivedAt: null,
                    },
                },
            });

            return {
                ok: true as const,
                data: {
                    teamId: team.id,
                    archivedAt: null,
                },
            };
        });
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Failed to unarchive team",
            },
        };
    }
}
