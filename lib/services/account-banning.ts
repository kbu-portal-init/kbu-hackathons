import "server-only";

import type { UserRole } from "@/lib/auth/guards";
import type { AccountActionData, BanAccountInput, UnbanAccountInput } from "@/lib/contracts/accounts";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import prisma from "@/lib/prisma";
import { isNotificationDeliveryError, sendNotification } from "@/lib/services/notifications";

type ManagementRole = Extract<UserRole, "organizer" | "admin">;

export async function banAccount(
    input: BanAccountInput,
    actorRole: ManagementRole,
    actorId: string,
): Promise<ActionResult<AccountActionData>> {
    const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
            id: true,
            role: true,
            email: true,
            team: { select: { members: { select: { studentEmail: true } } } },
        },
    });
    if (!user || user.role === "admin" || (actorRole === "organizer" && user.role !== "team")) {
        return {
            ok: false,
            error: { code: ErrorCodes.ACCOUNT_NOT_BANNABLE, message: "This account cannot be banned" },
        };
    }

    try {
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
                    targetId: current.id,
                    details: { reason: input.reason, expiresAt: input.expiresAt?.toISOString() ?? null },
                },
            });
        });
    } catch (error) {
        if (error instanceof Error && error.message === "ACCOUNT_NOT_BANNABLE")
            return {
                ok: false,
                error: {
                    code: ErrorCodes.ACCOUNT_NOT_BANNABLE,
                    message: "This account cannot be banned",
                },
            };
        throw error;
    }
    const recipients = user.team?.members.map((member) => member.studentEmail) ?? [];
    try {
        await sendNotification({
            type: "ACCOUNT_BANNED",
            recipients: recipients.length > 0 ? recipients : [user.email],
            data: { reason: input.reason, expiresAt: input.expiresAt?.toISOString() ?? null },
            actorId,
            targetType: "User",
            targetId: user.id,
        });
    } catch (error) {
        if (isNotificationDeliveryError(error)) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.EMAIL_SEND_FAILED,
                    message: "The account was banned, but the notification email could not be delivered.",
                },
            };
        }
        throw error;
    }
    return { ok: true, data: { userId: user.id } };
}

export async function unbanAccount(
    input: UnbanAccountInput,
    actorRole: ManagementRole,
    actorId: string,
): Promise<ActionResult<AccountActionData>> {
    const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
            id: true,
            role: true,
            email: true,
            team: { select: { members: { select: { studentEmail: true } } } },
        },
    });
    if (!user || user.role === "admin" || (actorRole === "organizer" && user.role !== "team"))
        return {
            ok: false,
            error: {
                code: ErrorCodes.ACCOUNT_NOT_MANAGEABLE,
                message: "This account cannot be managed",
            },
        };
    try {
        await prisma.$transaction(async (tx) => {
            const current = await tx.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
            if (!current || current.role === "admin" || (actorRole === "organizer" && current.role !== "team"))
                throw new Error("ACCOUNT_NOT_MANAGEABLE");
            await tx.user.update({
                where: { id: current.id },
                data: { banned: false, banReason: null, banExpires: null },
            });
            await tx.auditLog.create({
                data: { actorId, action: "ACCOUNT_UNBANNED", targetType: "User", targetId: current.id },
            });
        });
    } catch (error) {
        if (error instanceof Error && error.message === "ACCOUNT_NOT_MANAGEABLE")
            return {
                ok: false,
                error: {
                    code: ErrorCodes.ACCOUNT_NOT_MANAGEABLE,
                    message: "This account cannot be managed",
                },
            };
        throw error;
    }
    const recipients = user.team?.members.map((member) => member.studentEmail) ?? [];
    try {
        await sendNotification({
            type: "ACCOUNT_UNBANNED",
            recipients: recipients.length > 0 ? recipients : [user.email],
            data: {},
            actorId,
            targetType: "User",
            targetId: user.id,
        });
    } catch (error) {
        if (isNotificationDeliveryError(error)) {
            return {
                ok: false,
                error: {
                    code: ErrorCodes.EMAIL_SEND_FAILED,
                    message: "The account was restored, but the notification email could not be delivered.",
                },
            };
        }
        throw error;
    }
    return { ok: true, data: { userId: user.id } };
}
