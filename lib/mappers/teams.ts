import type { TeamDetailDTO, TeamListItem } from "@/lib/contracts/teams";

type TeamListRecord = {
    id: string;
    userId: string | null;
    displayName: string;
    loginName: string;
    imageUrl: string | null;
    createdAt: Date;
    user: { banned: boolean; banReason: string | null; banExpires: Date | null } | null;
    members: {
        id: string;
        name?: string;
        studentEmail?: string;
        role?: string;
        imageUrl?: string | null;
        studentEmailVerifiedAt?: Date | null;
    }[];
    submission: { id: string } | null;
    registration: { status: string } | null;
};

export function toTeamListItem(record: TeamListRecord): TeamListItem {
    return {
        id: record.id,
        userId: record.userId,
        displayName: record.displayName,
        loginName: record.loginName,
        imageUrl: record.imageUrl,
        memberCount: record.members.length,
        submissionCount: record.submission ? 1 : 0,
        registrationStatus: record.registration?.status ?? "UNKNOWN",
        banned: record.user?.banned ?? false,
        banReason: record.user?.banReason ?? null,
        banExpires: record.user?.banExpires?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
    };
}

export function toTeamDetail(
    record: TeamListRecord & {
        updatedAt: Date;
        registration: {
            status: string;
            submittedAt: Date | null;
            applicationNotes: string | null;
            withdrawnAt: Date | null;
            reviews: { id: string; decision: string; reason: string | null; createdAt: Date }[];
        } | null;
        members: {
            id: string;
            name: string;
            studentEmail: string;
            role: string;
            imageUrl: string | null;
            studentEmailVerifiedAt: Date | null;
        }[];
        submission: {
            id: string;
            title: string;
            description: string | null;
            repositoryUrl: string | null;
            demoUrl: string | null;
            presentationUrl: string | null;
            submittedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    },
): TeamDetailDTO {
    const base = toTeamListItem(record);
    return {
        ...base,
        updatedAt: record.updatedAt.toISOString(),
        submittedAt: record.registration?.submittedAt?.toISOString() ?? null,
        applicationNotes: record.registration?.applicationNotes ?? null,
        withdrawnAt: record.registration?.withdrawnAt?.toISOString() ?? null,
        members: record.members.map((member) => ({
            id: member.id,
            name: member.name ?? "",
            email: member.studentEmail ?? "",
            role: member.role ?? "OTHER",
            imageUrl: member.imageUrl ?? null,
            verifiedAt: member.studentEmailVerifiedAt?.toISOString() ?? null,
        })),
        reviews:
            record.registration?.reviews.map((review) => ({
                id: review.id,
                decision: review.decision,
                reason: review.reason,
                createdAt: review.createdAt.toISOString(),
            })) ?? [],
        submission: record.submission
            ? {
                  ...record.submission,
                  submittedAt: record.submission.submittedAt?.toISOString() ?? null,
                  createdAt: record.submission.createdAt.toISOString(),
                  updatedAt: record.submission.updatedAt.toISOString(),
              }
            : null,
    };
}
