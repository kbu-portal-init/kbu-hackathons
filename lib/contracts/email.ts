import { z } from "zod";

export type EmailMessage = {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
};

export const notificationTypes = [
    "PASSWORD_RESET",
    "SIGN_IN_LINK",
    "STUDENT_EMAIL_VERIFICATION",
    "TEAM_REGISTRATION_APPROVED",
    "TEAM_REGISTRATION_REJECTED",
    "TEAM_REGISTRATION_REOPENED",
    "ACCOUNT_BANNED",
    "ACCOUNT_UNBANNED",
    "ORGANIZER_ACCOUNT_CREATED",
] as const;

export type NotificationType = (typeof notificationTypes)[number];
export type NotificationData = {
    verificationUrl?: string;
    teamName?: string;
    username?: string;
    resetUrl?: string;
    reason?: string | null;
    expiresAt?: string | null;
    loginEmail?: string;
};
export type NotificationInput = {
    type: NotificationType;
    recipients: string[];
    data: NotificationData;
    actorId?: string;
    targetType?: string;
    targetId?: string;
};
export type StudentEmailVerificationData = {
    teamMemberId: string;
    verifiedAt: string;
    alreadyVerified: boolean;
};

export const studentEmailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid student email")
    .regex(/^u\d{12}@ms\.kbu\.ac\.th$/, "Student email must match uXXXXXXXXXXXX@ms.kbu.ac.th");

export const studentEmailVerificationSchema = z.object({ teamMemberId: z.string().min(1) });
