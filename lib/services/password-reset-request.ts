import "server-only";

import { findTeamAccountByUsername, isApprovedTeamAccount } from "@/lib/auth/team-access";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/services/notifications";
import { createPasswordResetUrl } from "@/lib/services/password-reset";

export async function requestPasswordReset(input: { email?: string; username?: string }) {
    const user = input.username
        ? await findTeamAccountByUsername(input.username)
        : input.email
          ? await prisma.user.findUnique({
                where: { email: input.email },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    team: {
                        select: {
                            archivedAt: true,
                            registration: { select: { status: true } },
                            members: {
                                where: { role: "LEADER", studentEmailVerifiedAt: { not: null } },
                                select: { studentEmail: true },
                                take: 1,
                            },
                        },
                    },
                },
            })
          : null;

    if (!user) return { sent: false as const, found: false as const, blocked: "UNKNOWN_IDENTIFIER" as const };

    if (input.username && !isApprovedTeamAccount(user)) {
        return { sent: false as const, found: true as const, blocked: "PENDING_TEAM" as const };
    }

    if (!input.username && user.role === "team" && !isApprovedTeamAccount(user)) {
        return { sent: false as const, found: true as const, blocked: "PENDING_TEAM" as const };
    }

    const recipient = user.role === "team" ? user.team?.members[0]?.studentEmail : user.email;
    if (!recipient) return { sent: false as const, found: true as const };

    const resetUrl = await createPasswordResetUrl(user.id);
    await sendNotification({
        type: "PASSWORD_RESET",
        recipients: [recipient],
        data: { resetUrl },
        targetType: "User",
        targetId: user.id,
    });

    return { sent: true as const, found: true as const };
}
