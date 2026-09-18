import "server-only";

import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/services/notifications";
import { createPasswordResetUrl } from "@/lib/services/password-reset";

export async function requestPasswordReset(input: { email?: string; username?: string }) {
    const user = input.username
        ? await prisma.user.findFirst({
              where: { username: input.username, role: "team" },
              select: {
                  id: true,
                  team: {
                      select: {
                          members: {
                              where: { role: "LEADER", studentEmailVerifiedAt: { not: null } },
                              select: { studentEmail: true },
                              take: 1,
                          },
                      },
                  },
              },
          })
        : input.email
          ? await prisma.user.findUnique({ where: { email: input.email }, select: { id: true, email: true } })
          : null;

    if (!user) return { sent: false as const, found: false as const };

    const recipient = "team" in user ? user.team?.members[0]?.studentEmail : user.email;
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
