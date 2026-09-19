import "server-only";

import prisma from "@/lib/prisma";

export type PanelOverview = {
    pendingRegistrationCount: number;
    approvedTeamCount: number;
    submittedSubmissionCount: number;
    organizerCount: number;
    totalTeamCount: number;
};

export async function getPanelOverview(): Promise<PanelOverview> {
    const [pendingRegistrationCount, approvedTeamCount, submittedSubmissionCount, organizerCount, totalTeamCount] =
        await Promise.all([
            prisma.registration.count({ where: { status: "PENDING" } }),
            prisma.registration.count({ where: { status: "APPROVED" } }),
            prisma.submission.count({ where: { submittedAt: { not: null } } }),
            prisma.user.count({ where: { role: "organizer" } }),
            prisma.team.count({ where: { archivedAt: null } }),
        ]);

    return {
        pendingRegistrationCount,
        approvedTeamCount,
        submittedSubmissionCount,
        organizerCount,
        totalTeamCount,
    };
}
