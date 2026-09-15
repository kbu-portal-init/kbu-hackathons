import "server-only";

import type { AccountActionData, BanAccountInput, UnbanAccountInput } from "@/lib/contracts/accounts";
import type { ActionResult } from "@/lib/contracts/common";
import prisma from "@/lib/prisma";
import type { ManagementRole } from "@/types/auth";

export async function banAccount(
    input: BanAccountInput,
    actorRole: ManagementRole,
    actorId: string,
): Promise<ActionResult<AccountActionData>> {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
    if (!user || user.role === "admin" || (actorRole === "organizer" && user.role !== "team")) {
        return { ok: false, error: { code: "ACCOUNT_NOT_BANNABLE", message: "This account cannot be banned" } };
    }

    await prisma.$transaction(async (tx) => {
        const current = await tx.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
        if (!current || current.role === "admin" || (actorRole === "organizer" && current.role !== "team"))
            throw new Error("ACCOUNT_NOT_BANNABLE");
        await tx.user.update({
            where: { id: current.id },
            data: { banned: true, banReason: input.reason, banExpires: input.expiresAt ?? null },
        });
        await tx.session.deleteMany({ where: { userId: current.id } });
        await tx.auditLog.create({
            data: {
                actorId,
                action: "ACCOUNT_BANNED",
                targetType: "User",
                targetId: user.id,
                details: { reason: input.reason, expiresAt: input.expiresAt?.toISOString() ?? null },
            },
        });
    });
    return { ok: true, data: { userId: user.id } };
}

export async function unbanAccount(
    input: UnbanAccountInput,
    actorRole: ManagementRole,
    actorId: string,
): Promise<ActionResult<AccountActionData>> {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
    if (!user || user.role === "admin" || (actorRole === "organizer" && user.role !== "team"))
        return { ok: false, error: { code: "ACCOUNT_NOT_MANAGEABLE", message: "This account cannot be managed" } };
    await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { banned: false, banReason: null, banExpires: null } }),
        prisma.auditLog.create({
            data: { actorId, action: "ACCOUNT_UNBANNED", targetType: "User", targetId: user.id },
        }),
    ]);
    return { ok: true, data: { userId: user.id } };
}
