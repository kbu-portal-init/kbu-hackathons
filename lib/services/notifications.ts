import "server-only";

import type { EmailMessage, NotificationData, NotificationInput, NotificationType } from "@/lib/contracts/email";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";

type RenderedNotification = Omit<EmailMessage, "to"> & { type: NotificationType };

type TeamRegistrationNotificationType =
    | "TEAM_REGISTRATION_APPROVED"
    | "TEAM_REGISTRATION_REJECTED"
    | "TEAM_REGISTRATION_REOPENED";

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
                subject: "Reset your KBU Hub password",
                text: `Reset your KBU Hub password using this link: ${data.resetUrl}`,
                html: `<p>Reset your KBU Hub password using the link below.</p><p><a href="${escapeHtml(data.resetUrl)}">Reset password</a></p>`,
            };
        case "STUDENT_EMAIL_VERIFICATION":
            return {
                type,
                subject: "Verify your KBU Hub student email",
                text: `Verify your student email using this link: ${data.verificationUrl}`,
                html: `<p>Verify your student email using the link below.</p><p><a href="${escapeHtml(data.verificationUrl)}">Verify email</a></p>`,
            };
        case "TEAM_REGISTRATION_APPROVED":
            return {
                type,
                subject: `${data.teamName ?? "Your team"} registration approved`,
                text: `Your team registration has been approved. You can now sign in to KBU Hub.\n\nUsername: ${data.username ?? "Not provided"}\nPassword: ${data.password ?? "Not provided"}`,
                html: `<p>Your team registration has been approved.</p><p>You can now sign in to KBU Hub.</p><p><strong>Username:</strong> ${escapeHtml(data.username) || "Not provided"}<br /><strong>Password:</strong> ${escapeHtml(data.password) || "Not provided"}</p>`,
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
                subject: "Your KBU Hub account has been restricted",
                text: `Your account has been restricted.${data.reason ? ` Reason: ${data.reason}` : ""}${data.expiresAt ? ` Until: ${data.expiresAt}` : ""}`,
                html: `<p>Your account has been restricted.</p>${data.reason ? `<p>Reason: ${escapeHtml(data.reason)}</p>` : ""}${data.expiresAt ? `<p>Until: ${escapeHtml(data.expiresAt)}</p>` : ""}`,
            };
        case "ACCOUNT_UNBANNED":
            return {
                type,
                subject: "Your KBU Hub account has been restored",
                text: "Your KBU Hub account restriction has been removed.",
                html: "<p>Your KBU Hub account restriction has been removed.</p>",
            };
        case "ORGANIZER_ACCOUNT_CREATED":
            return {
                type,
                subject: "Your KBU Hub organizer account is ready",
                text: `Your organizer account has been created.\n\nUsername: ${data.loginEmail ?? "Not provided"}\nPassword: ${data.password ?? "Not provided"}`,
                html: `<p>Your organizer account has been created.</p><p><strong>Username:</strong> ${escapeHtml(data.loginEmail) || "Not provided"}<br /><strong>Password:</strong> ${escapeHtml(data.password) || "Not provided"}</p>`,
            };
    }
}

function uniqueRecipients(recipients: string[]) {
    return [...new Set(recipients.map((recipient) => recipient.trim().toLowerCase()).filter(Boolean))];
}

export async function sendNotification(input: NotificationInput): Promise<{ sent: boolean; recipients: string[] }> {
    const recipients = uniqueRecipients(input.recipients);
    if (recipients.length === 0) return { sent: false, recipients };

    const rendered = renderNotification(input.type, input.data);
    const targetType = input.targetType ?? "Notification";
    const targetId = input.targetId ?? input.type;

    try {
        await sendEmail({ ...rendered, to: recipients });
        await prisma.auditLog.create({
            data: {
                actorId: input.actorId,
                action: "EMAIL_SENT",
                targetType,
                targetId,
                details: { notificationType: input.type, recipients },
            },
        });
        return { sent: true, recipients };
    } catch (error) {
        await prisma.auditLog.create({
            data: {
                actorId: input.actorId,
                action: "EMAIL_SEND_FAILED",
                targetType,
                targetId,
                details: {
                    notificationType: input.type,
                    recipients,
                    error: error instanceof Error ? error.message : "Unknown email delivery error",
                },
            },
        });
        return { sent: false, recipients };
    }
}

export async function sendTeamRegistrationNotification(input: {
    type: TeamRegistrationNotificationType;
    teamId: string;
    registrationId?: string;
    data: Pick<NotificationData, "teamName" | "reason" | "username" | "password">;
    actorId?: string;
}): Promise<{ sent: boolean; recipients: string[] }> {
    const team = await prisma.team.findUnique({
        where: { id: input.teamId },
        select: {
            id: true,
            displayName: true,
            members: { select: { studentEmail: true } },
        },
    });

    if (!team) return { sent: false, recipients: [] };

    return sendNotification({
        type: input.type,
        recipients: team.members.map((member) => member.studentEmail),
        data: {
            teamName: input.data.teamName ?? team.displayName,
            reason: input.data.reason,
            username: input.data.username,
            password: input.data.password,
        },
        actorId: input.actorId,
        targetType: "Registration",
        targetId: input.registrationId ?? input.teamId,
    });
}
