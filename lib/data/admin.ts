import "server-only";

import type { AdminOverview } from "@/lib/contracts/admin";
import { toAdminOverview } from "@/lib/mappers/admin";
import prisma from "@/lib/prisma";

export async function getAdminOverview(): Promise<AdminOverview> {
    const [organizerCount, teamCount, bannedAccountCount] = await Promise.all([
        prisma.user.count({ where: { role: "organizer" } }),
        prisma.user.count({ where: { role: "team" } }),
        prisma.user.count({ where: { banned: true } }),
    ]);
    return toAdminOverview({ organizerCount, teamCount, bannedAccountCount });
}
