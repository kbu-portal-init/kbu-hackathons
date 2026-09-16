import { z } from "zod";

export type EmailMessage = {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
};

export type StudentEmailVerificationData = { teamMemberId: string; verifiedAt: string };
export const studentEmailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid student email")
    .refine((email) => email.endsWith("@ms.kbu.ac.th"), "Student email must use the @ms.kbu.ac.th domain");
export const studentEmailVerificationSchema = z.object({ teamMemberId: z.string().min(1) });
