import "server-only";

import type {
    AddTeamMemberInput,
    TeamSubmission,
    TeamWorkspace,
    UpdateTeamProfileInput,
    UpsertSubmissionInput,
} from "@/lib/contracts/team-workspace";
import { toTeamSubmission, toTeamWorkspace } from "@/lib/mappers/team-workspace";
import prisma from "@/lib/prisma";

export class TeamWorkspaceError extends Error {
    constructor(
        public code: "NOT_FOUND" | "MEMBER_EXISTS" | "UPDATE_FAILED",
        message: string,
    ) {
        super(message);
    }
}

export async function updateTeamProfile(
    teamId: string,
    input: UpdateTeamProfileInput,
    actorId: string,
): Promise<TeamWorkspace> {
    const team = await prisma.team.update({
        where: { id: teamId },
        data: { displayName: input.displayName },
        select: {
            id: true,
            loginName: true,
            displayName: true,
            imageUrl: true,
            archivedAt: true,
            createdAt: true,
            _count: { select: { members: true } },
            registration: { select: { status: true } },
        },
    });

    await prisma.auditLog.create({
        data: {
            actorId,
            action: "TEAM_PROFILE_UPDATED",
            targetType: "Team",
            targetId: teamId,
            details: { displayName: input.displayName },
        },
    });

    return toTeamWorkspace(team);
}

export async function addTeamMember(teamId: string, input: AddTeamMemberInput, actorId: string): Promise<void> {
    const existing = await prisma.teamMember.findUnique({
        where: { teamId_studentEmail: { teamId, studentEmail: input.studentEmail } },
        select: { id: true },
    });

    if (existing) {
        throw new TeamWorkspaceError("MEMBER_EXISTS", "A member with this student email already exists");
    }

    await prisma.$transaction([
        prisma.teamMember.create({
            data: { teamId, name: input.name, studentEmail: input.studentEmail },
        }),
        prisma.auditLog.create({
            data: {
                actorId,
                action: "TEAM_MEMBER_ADDED",
                targetType: "Team",
                targetId: teamId,
                details: { name: input.name, studentEmail: input.studentEmail },
            },
        }),
    ]);
}

export async function removeTeamMember(teamId: string, memberId: string, actorId: string): Promise<void> {
    await prisma.$transaction([
        prisma.teamMember.deleteMany({ where: { id: memberId, teamId } }),
        prisma.auditLog.create({
            data: {
                actorId,
                action: "TEAM_MEMBER_REMOVED",
                targetType: "Team",
                targetId: teamId,
                details: { memberId },
            },
        }),
    ]);
}

export async function upsertSubmission(
    teamId: string,
    input: UpsertSubmissionInput,
    actorId: string,
): Promise<TeamSubmission> {
    const payload = {
        title: input.title,
        description: input.description?.trim() || null,
        repositoryUrl: input.repositoryUrl?.trim() || null,
        demoUrl: input.demoUrl?.trim() || null,
        presentationUrl: input.presentationUrl?.trim() || null,
    };

    const submission = await prisma.submission.upsert({
        where: { teamId },
        create: { teamId, ...payload, submittedAt: new Date() },
        update: { ...payload, submittedAt: new Date() },
        select: {
            id: true,
            title: true,
            description: true,
            repositoryUrl: true,
            demoUrl: true,
            presentationUrl: true,
            submittedAt: true,
            updatedAt: true,
        },
    });

    await prisma.auditLog.create({
        data: {
            actorId,
            action: "SUBMISSION_UPSERTED",
            targetType: "Team",
            targetId: teamId,
            details: { submissionId: submission.id, title: submission.title },
        },
    });

    return toTeamSubmission(submission);
}
