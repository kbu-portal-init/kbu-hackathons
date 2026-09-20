import "server-only";

import type { AdminProfileDTO } from "@/lib/contracts/admin-profile";
import prisma from "@/lib/prisma";

export async function getAdminProfile(userId: string): Promise<AdminProfileDTO | null> {
    return prisma.user.findFirst({
        where: { id: userId, role: "admin" },
        select: { id: true, name: true, email: true, image: true, role: true, emailVerified: true },
    });
}
