import "server-only";

import { after } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { EmailMessage, NotificationData, NotificationInput, NotificationType } from "@/lib/contracts/email";
import type { SendNotificationInput } from "@/lib/contracts/notifications";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";

type RenderedNotification = Omit<EmailMessage, "to"> & { type: NotificationType };

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

function escapeHtml(value: string | undefined | null) {
    return (value ?? "").replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character];
    });
}

function renderNotification(type: NotificationType, data: NotificationData): RenderedNotification {
    switch (type) {
        case "PASSWORD_RESET":
            return {
                type,
                subject: "Reset your KBU Hackathon 2026 password",
                text: `Reset your KBU Hackathon 2026 password using this link: ${data.resetUrl}`,
                html: `<p>Reset your KBU Hackathon 2026 password using the link below.</p><p><a href="${escapeHtml(data.resetUrl)}">Reset password</a></p>`,
            };
        case "STUDENT_EMAIL_VERIFICATION":
            return {
                type,
                subject: "Verify your KBU Hackathon 2026 student email",
                text: `Verify your student email using this link: ${data.verificationUrl}`,
                html: `<p>Verify your student email using the link below.</p><p><a href="${escapeHtml(data.verificationUrl)}">Verify email</a></p>`,
            };
        case "TEAM_REGISTRATION_APPROVED":
            return {
                type,
                subject: `${data.teamName ?? "Your team"} registration approved`,
                text: `Your team registration has been approved.\n\nTeam: ${data.teamName ?? "Not provided"}\n\nSet your team password using this link: ${data.resetUrl}`,
                html: `<p>Your team registration has been approved.</p><p><strong>Team:</strong> ${escapeHtml(data.teamName) || "Not provided"}</p><p><a href="${escapeHtml(data.resetUrl)}">Set your team password</a></p>`,
            };
        case "TEAM_REGISTRATION_REJECTED":
            return {
                type,
                subject: `${data.teamName ?? "Your team"} registration update`,
                text: `Your team registration was not approved.${data.reason ? ` Reason: ${data.reason}` : ""}`,
                html: `<p>Your team registration was not approved.</p>${data.reason ? `<p>Reason: ${escapeHtml(data.reason)}</p>` : ""}`,
            };
        case "TEAM_REGISTRATION_REOPENED":
            return {
                type,
                subject: `${data.teamName ?? "Your team"} registration reopened`,
                text: `Your team registration has been reopened for changes.${data.reason ? ` Note: ${data.reason}` : ""}`,
                html: `<p>Your team registration has been reopened for changes.</p>${data.reason ? `<p>Note: ${escapeHtml(data.reason)}</p>` : ""}`,
            };
        case "ACCOUNT_BANNED":
            return {
                type,
                subject: "Your KBU Hackathon 2026 account has been restricted",
                text: `Your account has been restricted.${data.reason ? ` Reason: ${data.reason}` : ""}${data.expiresAt ? ` Until: ${data.expiresAt}` : ""}`,
                html: `<p>Your account has been restricted.</p>${data.reason ? `<p>Reason: ${escapeHtml(data.reason)}</p>` : ""}${data.expiresAt ? `<p>Until: ${escapeHtml(data.expiresAt)}</p>` : ""}`,
            };
        case "ACCOUNT_UNBANNED":
            return {
                type,
                subject: "Your KBU Hackathon 2026 account has been restored",
                text: "Your KBU Hackathon 2026 account restriction has been removed.",
                html: "<p>Your KBU Hackathon 2026 account restriction has been removed.</p>",
            };
        case "ORGANIZER_ACCOUNT_CREATED":
            return {
                type,
                subject: "Your KBU Hackathon 2026 organizer account is ready",
                text: `Your organizer account has been created. Set your password using this link: ${data.resetUrl}`,
                html: `<p>Your organizer account has been created.</p><p><a href="${escapeHtml(data.resetUrl)}">Set your password</a></p>`,
            };
    }
}

function uniqueRecipients(recipients: string[]) {
    return [...new Set(recipients.map((recipient) => recipient.trim().toLowerCase()).filter(Boolean))];
}

function renderCustomEmail(subject: string, body: string): Omit<EmailMessage, "to"> {
    const html = escapeHtml(body).replace(/\r?\n/g, "<br />");
    return { subject, text: body, html: `<p>${html}</p>` };
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
    if (recipients.length === 0) {
        throw new NotificationDeliveryError([], new Error("Notification has no recipients"));
    }

    const rendered = renderNotification(input.type, input.data);
    const targetType = input.targetType ?? "Notification";
    const targetId = input.targetId ?? input.type;

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
            const rendered = renderCustomEmail(input.subject, input.body);
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
    data: Pick<NotificationData, "teamName" | "reason" | "username" | "resetUrl">;
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
