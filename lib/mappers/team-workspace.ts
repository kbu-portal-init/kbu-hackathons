import type {
    TeamMemberProfile,
    TeamMemberRole,
    TeamSubmission,
    TeamWorkspace,
    TeamWorkspaceView,
} from "@/lib/contracts/team-workspace";
import type { RegistrationStatusValue } from "@/lib/contracts/teams";

export type TeamWorkspaceRecord = {
    id: string;
    loginName: string;
    displayName: string;
    imageUrl: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    _count: { members: number };
    registration: { status: RegistrationStatusValue } | null;
};

export type TeamMemberRecord = {
    id: string;
    name: string;
    studentEmail: string;
    role: TeamMemberRole;
    studentEmailVerifiedAt: Date | null;
    createdAt: Date;
};

export type TeamSubmissionRecord = {
    id: string;
    title: string;
    description: string | null;
    repositoryUrl: string | null;
    demoUrl: string | null;
    presentationUrl: string | null;
    submittedAt: Date | null;
    updatedAt: Date;
};

export function toTeamWorkspace(record: TeamWorkspaceRecord): TeamWorkspace {
    return {
        id: record.id,
        loginName: record.loginName,
        displayName: record.displayName,
        imageUrl: record.imageUrl,
        registrationStatus: record.registration?.status ?? null,
        memberCount: record._count.members,
        createdAt: record.createdAt.toISOString(),
    };
}

export function toTeamMemberProfile(record: TeamMemberRecord): TeamMemberProfile {
    return {
        id: record.id,
        name: record.name,
        studentEmail: record.studentEmail,
        role: record.role,
        studentEmailVerified: record.studentEmailVerifiedAt !== null,
        createdAt: record.createdAt.toISOString(),
    };
}

export function toTeamSubmission(record: TeamSubmissionRecord): TeamSubmission {
    return {
        id: record.id,
        title: record.title,
        description: record.description,
        repositoryUrl: record.repositoryUrl,
        demoUrl: record.demoUrl,
        presentationUrl: record.presentationUrl,
        submittedAt: record.submittedAt?.toISOString() ?? null,
        updatedAt: record.updatedAt.toISOString(),
    };
}

export function toTeamWorkspaceView(
    team: TeamWorkspaceRecord,
    members: TeamMemberRecord[],
    submission: TeamSubmissionRecord | null,
): TeamWorkspaceView {
    return {
        team: toTeamWorkspace(team),
        members: members.map(toTeamMemberProfile),
        submission: submission ? toTeamSubmission(submission) : null,
    };
}
