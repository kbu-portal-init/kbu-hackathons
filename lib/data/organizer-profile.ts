import "server-only";

import type { OrganizerProfileDTO } from "@/lib/contracts/organizer-profile";
import prisma from "@/lib/prisma";

export async function getOrganizerProfile(userId: string): Promise<OrganizerProfileDTO | null> {
    return prisma.user.findFirst({
        where: { id: userId, role: "organizer" },
        select: { id: true, name: true, email: true, image: true, role: true, emailVerified: true },
    });
}
