import { z } from "zod";

export type EmailMessage = {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
};

export type StudentEmailVerificationData = { teamMemberId: string; verifiedAt: string };
export const studentEmailVerificationSchema = z.object({ teamMemberId: z.string().min(1) });
