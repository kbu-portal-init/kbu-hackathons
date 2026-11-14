import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type {
    CreateTeamMemberData,
    CreateTeamMemberInput,
    DeleteTeamMemberData,
    DeleteTeamMemberInput,
    UpdateManagementMemberImageData,
    UpdateManagementMemberImageInput,
    UpdateMemberImageData,
    UpdateMemberImageInput,
    UpdateTeamMemberData,
    UpdateTeamMemberInput,
} from "@/lib/contracts/team-members";
import prisma from "@/lib/prisma";
import { isOwnedR2PublicUrl, R2_PUBLIC_URL } from "@/lib/r2";
import { deleteObject } from "@/lib/services/storage";

export async function createTeamMember(
    input: CreateTeamMemberInput,
    actorId: string,
): Promise<ActionResult<CreateTeamMemberData>> {
    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
                SELECT id
                FROM "team"
                WHERE id = ${input.teamId}
                FOR UPDATE
                `;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: { id: true },
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

            const settings = await tx.eventSettings.findUnique({
                where: { id: 1 },
                select: { maxTeamSize: true },
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

            const memberCount = await tx.teamMember.count({
                where: { teamId: input.teamId },
            });
            if (memberCount >= settings.maxTeamSize) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.INVALID_TEAM_SIZE,
                        message: "Team size limit reached",
                    },
                };
            }
            if (input.role === "LEADER") {
                const existingLeader = await tx.teamMember.findFirst({
                    where: { teamId: input.teamId, role: "LEADER" },
                    select: { id: true },
                });
                if (existingLeader) {
                    return {
                        ok: false as const,
                        error: {
                            code: ErrorCodes.TEAM_LEADER_ALREADY_EXISTS,
                            message: "This team already has a leader.",
                        },
                    };
                }
            }
            const member = await tx.teamMember.create({
                data: {
                    teamId: input.teamId,
                    name: input.name,
                    studentEmail: input.studentEmail,
                    role: input.role,
                },
                select: {
                    id: true,
                    name: true,
                    studentEmail: true,
                    role: true,
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_MEMBER_CREATED",
                    targetType: "TeamMember",
                    targetId: member.id,
                    details: {
                        teamId: input.teamId,
                        name: input.name,
                        studentEmail: input.studentEmail,
                        role: input.role,
                    },
                },
            });

            return {
                ok: true as const,
                data: member,
            };
        });
        return result;
    } catch (error) {
        const databaseError = error as {
            code?: string;
            message?: string;
            meta?: unknown;
        };
        const details = `${databaseError.message ?? ""} ${JSON.stringify(databaseError.meta ?? "")}`;

        if (databaseError.code === "P2002" && details.includes("team_member_student_email_key")) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.EMAIL_EXISTS,
                    message: "A team member with this student email already exists",
                },
            };
        }

        return {
            ok: false,
            error: {
                code: ErrorCodes.CREATE_FAILED,
                message: "Failed to create team member",
            },
        };
    }
}

export async function updateTeamMember(
    input: UpdateTeamMemberInput,
    actorId: string,
): Promise<ActionResult<UpdateTeamMemberData>> {
    try {
        return await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
                SELECT id
                FROM "team"
                WHERE id = ${input.teamId}
                FOR UPDATE
            `;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: { id: true },
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

            const existingMember = await tx.teamMember.findFirst({
                where: {
                    id: input.memberId,
                    teamId: input.teamId,
                },
                select: {
                    id: true,
                    name: true,
                    studentEmail: true,
                    role: true,
                    studentEmailVerifiedAt: true,
                },
            });

            if (!existingMember) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                        message: "Team member not found",
                    },
                };
            }

            if (existingMember.role === "LEADER" && input.role !== "LEADER") {
                const anotherLeader = await tx.teamMember.findFirst({
                    where: {
                        teamId: input.teamId,
                        role: "LEADER",
                        id: { not: input.memberId },
                    },
                    select: { id: true },
                });

                if (!anotherLeader) {
                    return {
                        ok: false as const,
                        error: {
                            code: ErrorCodes.TEAM_LEADER_REQUIRED,
                            message: "The team must have at least one leader.",
                        },
                    };
                }
            }

            if (existingMember.role !== "LEADER" && input.role === "LEADER") {
                const existingLeader = await tx.teamMember.findFirst({
                    where: {
                        teamId: input.teamId,
                        role: "LEADER",
                        id: { not: input.memberId },
                    },
                    select: { id: true },
                });

                if (existingLeader) {
                    return {
                        ok: false as const,
                        error: {
                            code: ErrorCodes.TEAM_LEADER_ALREADY_EXISTS,
                            message: "This team already has a leader.",
                        },
                    };
                }
            }

            const emailChanged = existingMember.studentEmail !== input.studentEmail;

            const member = await tx.teamMember.update({
                where: { id: input.memberId },
                data: {
                    name: input.name,
                    studentEmail: input.studentEmail,
                    role: input.role,
                    ...(emailChanged ? { studentEmailVerifiedAt: null } : {}),
                },
                select: {
                    id: true,
                    name: true,
                    studentEmail: true,
                    role: true,
                    studentEmailVerifiedAt: true,
                },
            });

            if (emailChanged) {
                await tx.studentEmailVerification.deleteMany({
                    where: {
                        teamMemberId: input.memberId,
                        verifiedAt: null,
                    },
                });
            }

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_MEMBER_UPDATED",
                    targetType: "TeamMember",
                    targetId: member.id,
                    details: {
                        teamId: input.teamId,
                        previous: {
                            name: existingMember.name,
                            studentEmail: existingMember.studentEmail,
                            role: existingMember.role,
                        },
                        updated: {
                            name: member.name,
                            studentEmail: member.studentEmail,
                            role: member.role,
                        },
                        emailChanged,
                    },
                },
            });

            return {
                ok: true as const,
                data: {
                    ...member,
                    studentEmailVerifiedAt: member.studentEmailVerifiedAt?.toISOString() ?? null,
                    emailChanged,
                },
            };
        });
    } catch (error) {
        const databaseError = error as {
            code?: string;
            message?: string;
            meta?: unknown;
        };

        const details = `${databaseError.message ?? ""} ${JSON.stringify(databaseError.meta ?? "")}`;

        if (databaseError.code === "P2002" && details.includes("team_member_student_email_key")) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.EMAIL_EXISTS,
                    message: "A team member with this student email already exists",
                },
            };
        }

        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Failed to update team member",
            },
        };
    }
}

export async function updateMemberImage(
    teamId: string,
    input: UpdateMemberImageInput,
): Promise<ActionResult<UpdateMemberImageData>> {
    if (input.imageUrl && !isOwnedR2PublicUrl(input.imageUrl, `uploads/${teamId}`)) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.IMAGE_NOT_OWNED,
                message: "Member image must be uploaded to your team storage area",
            },
        };
    }

    try {
        const member = await prisma.teamMember.findFirst({
            where: { id: input.memberId, teamId },
            select: { id: true },
        });

        if (!member) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                    message: "Team member not found",
                },
            };
        }

        await prisma.teamMember.update({
            where: { id: input.memberId },
            data: { imageUrl: input.imageUrl },
        });

        return { ok: true, data: { imageUrl: input.imageUrl } };
    } catch {
        return {
            ok: false,
            error: { code: ErrorCodes.UPDATE_FAILED, message: "Failed to update" },
        };
    }
}

export async function updateManagementMemberImage(
    input: UpdateManagementMemberImageInput,
    actorId: string,
): Promise<ActionResult<UpdateManagementMemberImageData>> {
    if (input.imageUrl && !isOwnedR2PublicUrl(input.imageUrl, `uploads/${input.teamId}`)) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.IMAGE_NOT_OWNED,
                message: "Member image must be uploaded to your team storage area",
            },
        };
    }

    try {
        return await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "team" WHERE id = ${input.teamId} FOR UPDATE`;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: { id: true },
            });

            if (!team) {
                return {
                    ok: false,
                    error: {
                        code: ErrorCodes.TEAM_NOT_FOUND,
                        message: "Team not found",
                    },
                };
            }

            const member = await tx.teamMember.findFirst({
                where: {
                    id: input.memberId,
                    teamId: input.teamId,
                },
                select: {
                    id: true,
                    imageUrl: true,
                },
            });

            if (!member) {
                return {
                    ok: false,
                    error: {
                        code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                        message: "Team member not found",
                    },
                };
            }

            if (member.imageUrl === input.imageUrl) {
                return {
                    ok: true,
                    data: { imageUrl: input.imageUrl },
                };
            }

            await tx.teamMember.update({
                where: { id: input.memberId },
                data: { imageUrl: input.imageUrl },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_MEMBER_IMAGE_UPDATED",
                    targetType: "TeamMember",
                    targetId: input.memberId,
                    details: {
                        teamId: input.teamId,
                        previousImageUrl: member.imageUrl,
                        imageUrl: input.imageUrl,
                    },
                },
            });

            return {
                ok: true,
                data: { imageUrl: input.imageUrl },
            };
        });
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.UPDATE_FAILED,
                message: "Failed to update team member image",
            },
        };
    }
}

export async function deleteTeamMember(
    input: DeleteTeamMemberInput,
    actorId: string,
    cleanupCard: typeof deleteObject = deleteObject,
): Promise<ActionResult<DeleteTeamMemberData>> {
    let result:
        | {
              ok: true;
              data: { id: string; cardKey: string | null; imageKey: string | null };
          }
        | {
              ok: false;
              error: { code: string; message: string };
          };

    try {
        result = await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
                SELECT id
                FROM "team"
                WHERE id = ${input.teamId}
                FOR UPDATE
            `;

            const team = await tx.team.findUnique({
                where: { id: input.teamId },
                select: { id: true },
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

            const existingMember = await tx.teamMember.findFirst({
                where: {
                    id: input.memberId,
                    teamId: input.teamId,
                },
                select: {
                    id: true,
                    name: true,
                    studentEmail: true,
                    role: true,
                    cardKey: true,
                    imageUrl: true,
                },
            });

            if (!existingMember) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.TEAM_MEMBER_NOT_FOUND,
                        message: "Team member not found",
                    },
                };
            }

            const settings = await tx.eventSettings.findUnique({
                where: { id: 1 },
                select: { minTeamSize: true },
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

            const memberCount = await tx.teamMember.count({
                where: { teamId: input.teamId },
            });
            if (memberCount - 1 < settings.minTeamSize) {
                return {
                    ok: false as const,
                    error: {
                        code: ErrorCodes.INVALID_TEAM_SIZE,
                        message: "Deleting this member would violate the minimum team size requirement",
                    },
                };
            }

            if (existingMember.role === "LEADER") {
                const anotherLeader = await tx.teamMember.findFirst({
                    where: {
                        teamId: input.teamId,
                        role: "LEADER",
                        id: { not: input.memberId },
                    },
                    select: { id: true },
                });

                if (!anotherLeader) {
                    return {
                        ok: false as const,
                        error: {
                            code: ErrorCodes.TEAM_LEADER_REQUIRED,
                            message: "The team must have at least one leader.",
                        },
                    };
                }
            }

            let imageKey: string | null = null;
            if (
                existingMember.imageUrl &&
                R2_PUBLIC_URL &&
                isOwnedR2PublicUrl(existingMember.imageUrl, `uploads/${input.teamId}`)
            ) {
                const baseUrl = new URL(`${R2_PUBLIC_URL}/`);
                imageKey = decodeURIComponent(
                    new URL(existingMember.imageUrl).pathname.slice(baseUrl.pathname.length).replace(/^\//, ""),
                );
            }

            await tx.teamMember.delete({
                where: { id: input.memberId },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "TEAM_MEMBER_DELETED",
                    targetType: "TeamMember",
                    targetId: existingMember.id,
                    details: {
                        teamId: input.teamId,
                        name: existingMember.name,
                        studentEmail: existingMember.studentEmail,
                        role: existingMember.role,
                        cardKey: existingMember.cardKey,
                    },
                },
            });

            return {
                ok: true as const,
                data: {
                    id: existingMember.id,
                    cardKey: existingMember.cardKey,
                    imageKey,
                },
            };
        });
    } catch {
        return {
            ok: false,
            error: {
                code: ErrorCodes.DELETE_FAILED,
                message: "Failed to delete team member",
            },
        };
    }

    if (!result.ok) {
        return result;
    }

    let cardCleanupFailed = false;

    if (result.data.cardKey) {
        try {
            const cleanup = await cleanupCard({ key: result.data.cardKey }, input.teamId);

            if (!cleanup.ok) {
                cardCleanupFailed = true;
            }
        } catch {
            cardCleanupFailed = true;
        }
    }
    let imageCleanupFailed = false;
    if (result.data.imageKey) {
        try {
            const cleanup = await cleanupCard({ key: result.data.imageKey }, input.teamId);
            imageCleanupFailed = !cleanup.ok;
        } catch {
            imageCleanupFailed = true;
        }
    }
    return {
        ok: true,
        data: {
            id: result.data.id,
            cardCleanupFailed,
            imageCleanupFailed,
        },
    };
}
