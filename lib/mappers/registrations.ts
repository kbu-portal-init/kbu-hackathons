import type { RegistrationDetailDTO, RegistrationListItem } from "@/lib/contracts/registration";

type RegistrationListItemRecord = {
    id: string;
    status: string;
    submittedAt: Date | null;
    createdAt: Date;
    teamDisplayName: string;
    teamLoginName: string;
    memberCount: number;
    leaderName: string;
    leaderEmail: string;
};

export function toRegistrationListItem(record: RegistrationListItemRecord): RegistrationListItem {
    return {
        id: record.id,
        teamName: record.teamDisplayName,
        loginName: record.teamLoginName,
        status: record.status,
        memberCount: record.memberCount,
        leaderName: record.leaderName,
        leaderEmail: record.leaderEmail,
        submittedAt: record.submittedAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
    };
}

type RegistrationDetailRecord = RegistrationListItemRecord & {
    applicationNotes: string | null;
    withdrawnAt: Date | null;
    updatedAt: Date;
    members: {
        id: string;
        name: string;
        role: string;
        email: string;
    }[];
    reviews: {
        id: string;
        decision: string;
        reason: string | null;
        createdAt: Date;
    }[];
};

export function toRegistrationDetail(record: RegistrationDetailRecord): RegistrationDetailDTO {
    return {
        ...toRegistrationListItem(record),
        applicationNotes: record.applicationNotes,
        withdrawnAt: record.withdrawnAt?.toISOString() ?? null,
        updatedAt: record.updatedAt.toISOString(),
        members: record.members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            email: m.email,
        })),
        reviews: record.reviews.map((rv) => ({
            id: rv.id,
            decision: rv.decision,
            reason: rv.reason,
            createdAt: rv.createdAt.toISOString(),
        })),
    };
}
