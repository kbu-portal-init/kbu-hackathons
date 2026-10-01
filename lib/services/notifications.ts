import "server-only";

import { after } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { NotificationData, NotificationInput } from "@/lib/contracts/email";
import type { SendNotificationInput } from "@/lib/contracts/notifications";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";
import { renderCustomEmailTemplate, renderNotificationTemplate } from "@/lib/services/email-templates";

type TeamRegistrationNotificationType =
    | "TEAM_REGISTRATION_APPROVED"
    | "TEAM_REGISTRATION_REJECTED"
    | "TEAM_REGISTRATION_REOPENED";

export class NotificationDeliveryError extends Error {
    readonly recipients: string[];

    constructor(recipients: string[], cause?: unknown) {
        super("Unable to deliver notification email", { cause });
        this.name = "NotificationDeliveryError";
        this.recipients = recipients;
    }
}

export function isNotificationDeliveryError(error: unknown): error is NotificationDeliveryError {
    return error instanceof NotificationDeliveryError;
}

export class NotificationTargetNotFoundError extends Error {
    constructor(message = "Notification target was not found") {
        super(message);
        this.name = "NotificationTargetNotFoundError";
    }
}

function uniqueRecipients(recipients: string[]) {
    return [...new Set(recipients.map((recipient) => recipient.trim().toLowerCase()).filter(Boolean))];
}

async function recordNotificationAudit(input: {
    actorId?: string;
    action: "EMAIL_SENT" | "EMAIL_SEND_FAILED" | "IN_APP_SENT";
    targetType: string;
    targetId: string;
    details: Prisma.InputJsonValue;
}) {
    try {
        if (input.actorId) {
            await prisma.auditLog.create({
                data: {
                    actorId: input.actorId,
                    action: input.action,
                    targetType: input.targetType,
                    targetId: input.targetId,
                    details: input.details,
                },
            });
        } else {
            await prisma.auditLog.create({
                data: {
                    action: input.action,
                    targetType: input.targetType,
                    targetId: input.targetId,
                    details: input.details,
                },
            });
        }
    } catch {
        // Notification delivery must not be reported as failed because audit logging is unavailable.
    }
}

function scheduleNotificationAudit(input: Parameters<typeof recordNotificationAudit>[0]) {
    try {
        after(async () => {
            await recordNotificationAudit(input);
        });
    } catch {
        // Audit logging is best-effort and must not change the outcome of an SMTP delivery.
    }
}

export async function sendNotification(input: NotificationInput): Promise<{ sent: true; recipients: string[] }> {
    const recipients = uniqueRecipients(input.recipients);
    const targetType = input.targetType ?? "Notification";
    const targetId = input.targetId ?? input.type;
    if (recipients.length === 0) {
        scheduleNotificationAudit({
            actorId: input.actorId,
            action: "EMAIL_SEND_FAILED",
            targetType,
            targetId,
            details: { notificationType: input.type, recipients: [], error: "Notification has no recipients" },
        });
        throw new NotificationDeliveryError([], new Error("Notification has no recipients"));
    }

    const rendered = renderNotificationTemplate(input.type, input.data);

    try {
        await sendEmail({ ...rendered, to: recipients });
        scheduleNotificationAudit({
            actorId: input.actorId,
            action: "EMAIL_SENT",
            targetType,
            targetId,
            details: { notificationType: input.type, recipients },
        });
        return { sent: true, recipients };
    } catch (error) {
        scheduleNotificationAudit({
            actorId: input.actorId,
            action: "EMAIL_SEND_FAILED",
            targetType,
            targetId,
            details: {
                notificationType: input.type,
                recipients,
                error: "Email delivery failed",
            },
        });
        throw new NotificationDeliveryError(recipients, error);
    }
}

export async function sendLoginNotification(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            team: {
                select: {
                    displayName: true,
                    members: {
                        where: { role: "LEADER", studentEmailVerifiedAt: { not: null } },
                        select: { studentEmail: true },
                        take: 1,
                    },
                },
            },
        },
    });
    if (!user || (user.role !== "team" && user.role !== "organizer" && user.role !== "admin")) return;

    const recipient = user.role === "team" ? user.team?.members[0]?.studentEmail : user.email;
    await sendNotification({
        type: "LOGIN_SUCCESS",
        recipients: recipient ? [recipient] : [],
        data: {
            teamName: user.team?.displayName,
            loginEmail: user.email,
            loginRole: user.role,
            loginAt: new Date().toISOString(),
        },
        targetType: "UserLogin",
        targetId: user.id,
    });
}

export async function sendManualNotification(input: SendNotificationInput & { actorId: string }) {
    const approvedTeamWhere = { registration: { status: "APPROVED" as const }, archivedAt: null };
    const sendsEmail = input.channel === "EMAIL" || input.channel === "BOTH";
    const sendsInApp = input.channel === "IN_APP" || input.channel === "BOTH";
    const teams =
        input.target.mode === "TEAM"
            ? await prisma.team.findMany({
                  where: { id: input.target.teamId, ...approvedTeamWhere },
                  select: { id: true, userId: true, members: { select: { studentEmail: true } } },
              })
            : input.target.mode === "ALL_TEAMS"
              ? await prisma.team.findMany({
                    where: approvedTeamWhere,
                    select: { id: true, userId: true, members: { select: { studentEmail: true } } },
                })
              : [];

    if (input.target.mode === "TEAM" && teams.length === 0)
        throw new NotificationTargetNotFoundError("Approved team was not found");

    let emailRecipients: string[] = [];
    if (sendsEmail) {
        emailRecipients = uniqueRecipients(
            input.target.mode === "EMAIL"
                ? [input.target.email]
                : teams.flatMap((team) => team.members.map((member) => member.studentEmail)),
        );
        if (emailRecipients.length === 0)
            throw new NotificationDeliveryError([], new Error("Notification has no recipients"));
    }

    const teamUserIds = sendsInApp ? [...new Set(teams.flatMap((team) => (team.userId ? [team.userId] : [])))] : [];
    if (sendsInApp && input.target.mode === "EMAIL") {
        const member = await prisma.teamMember.findFirst({
            where: { studentEmail: input.target.email, studentEmailVerifiedAt: { not: null }, team: approvedTeamWhere },
            select: { team: { select: { userId: true } } },
        });
        if (!member?.team.userId)
            throw new NotificationTargetNotFoundError("This email is not a verified member of an approved team");
        teamUserIds.push(member.team.userId);
    }

    const inAppRecipientIds = [...new Set(teamUserIds)];
    if (sendsInApp && inAppRecipientIds.length === 0)
        throw new NotificationDeliveryError([], new Error("Notification has no in-app recipients"));
    const createdNotifications = sendsInApp
        ? await prisma.notification.createManyAndReturn({
              data: inAppRecipientIds.map((recipientId) => ({
                  recipientId,
                  senderId: input.actorId,
                  subject: input.subject,
                  body: input.body,
                  targetType: "ManualNotification",
                  targetId: input.target.mode,
              })),
              select: { id: true },
          })
        : [];

    try {
        if (sendsEmail) {
            const rendered = renderCustomEmailTemplate(input.subject, input.body);
            await sendEmail({
                ...rendered,
                to: process.env.SMTP_FROM_EMAIL ?? emailRecipients[0],
                bcc: emailRecipients,
            });
        }
    } catch (error) {
        if (createdNotifications.length > 0) {
            try {
                await prisma.notification.deleteMany({
                    where: { id: { in: createdNotifications.map(({ id }) => id) } },
                });
            } catch {
                // Preserve the delivery error so callers do not treat a failed email as successful.
            }
        }
        scheduleNotificationAudit({
            actorId: input.actorId,
            action: "EMAIL_SEND_FAILED",
            targetType: "Notification",
            targetId: input.target.mode,
            details: { notificationType: "MANUAL", recipients: emailRecipients, error: "Email delivery failed" },
        });
        throw new NotificationDeliveryError(emailRecipients, error);
    }

    scheduleNotificationAudit({
        actorId: input.actorId,
        action: sendsEmail ? "EMAIL_SENT" : "IN_APP_SENT",
        targetType: "Notification",
        targetId: input.target.mode,
        details: {
            notificationType: "MANUAL",
            channel: input.channel,
            recipients: emailRecipients,
            inAppRecipients: inAppRecipientIds,
        },
    });
    return {
        sent: true as const,
        channel: input.channel,
        emailRecipientCount: emailRecipients.length,
        inAppRecipientCount: inAppRecipientIds.length,
    };
}

export async function sendTeamRegistrationNotification(input: {
    type: TeamRegistrationNotificationType;
    teamId: string;
    registrationId?: string;
    data: Partial<Pick<NotificationData, "teamName" | "reason" | "username" | "resetUrl">>;
    actorId?: string;
}): Promise<{ sent: boolean; recipients: string[] }> {
    const team = await prisma.team.findUnique({
        where: { id: input.teamId },
        select: {
            id: true,
            displayName: true,
            members: {
                where: { role: "LEADER", studentEmailVerifiedAt: { not: null } },
                select: { studentEmail: true },
                take: 1,
            },
        },
    });

    if (!team) throw new NotificationTargetNotFoundError("Team was not found");
    if (team.members.length === 0) {
        throw new NotificationDeliveryError([], new Error("Team has no verified leader email"));
    }
    if (input.type === "TEAM_REGISTRATION_APPROVED" && !input.data.resetUrl) {
        throw new Error("A password reset URL is required for team approval notifications");
    }

    return sendNotification({
        type: input.type,
        recipients: team.members.map((member) => member.studentEmail),
        data: {
            teamName: input.data.teamName ?? team.displayName,
            reason: input.data.reason,
            username: input.data.username,
            resetUrl: input.data.resetUrl,
        },
        actorId: input.actorId,
        targetType: "Registration",
        targetId: input.registrationId ?? input.teamId,
    });
}
