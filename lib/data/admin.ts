import "server-only";

import type { AdminOverview } from "@/lib/contracts/admin";
import { toAdminOverview } from "@/lib/mappers/admin";
import prisma from "@/lib/prisma";

export async function getAdminOverview(): Promise<AdminOverview> {
    const [
        organizerCount,
        teamCount,
        bannedAccountCount,
        teamMemberCount,
        registrationCount,
        pendingRegistrationCount,
        approvedRegistrationCount,
        rejectedRegistrationCount,
        submissionCount,
        auditLogCount,
        announcementCount,
        pendingVerificationCount,
    ] = await Promise.all([
        prisma.user.count({ where: { role: "organizer" } }),
        prisma.user.count({ where: { role: "team" } }),
        prisma.user.count({ where: { banned: true } }),
        prisma.teamMember.count(),
        prisma.registration.count(),
        prisma.registration.count({ where: { status: "PENDING" } }),
        prisma.registration.count({ where: { status: "APPROVED" } }),
        prisma.registration.count({ where: { status: "REJECTED" } }),
        prisma.submission.count(),
        prisma.auditLog.count(),
        prisma.announcement.count(),
        prisma.studentEmailVerification.count({ where: { verifiedAt: null } }),
    ]);
    return toAdminOverview({
        organizerCount,
        teamCount,
        bannedAccountCount,
        teamMemberCount,
        registrationCount,
        pendingRegistrationCount,
        approvedRegistrationCount,
        rejectedRegistrationCount,
        submissionCount,
        auditLogCount,
        announcementCount,
        pendingVerificationCount,
    });
}
