import prisma from "@/lib/prisma";

export async function getPublicMemberCard(cardShareToken: string): Promise<string | null> {
    const member = await prisma.teamMember.findUnique({
        where: { cardShareToken },
        select: { cardUrl: true },
    });

    return member?.cardUrl ?? null;
}
