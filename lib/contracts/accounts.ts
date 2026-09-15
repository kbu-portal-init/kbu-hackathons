import { z } from "zod";

export const banAccountSchema = z.object({
    userId: z.string().min(1),
    reason: z.string().trim().min(1).max(500),
    expiresAt: z.coerce
        .date()
        .refine((date) => date > new Date(), "Expiry must be in the future")
        .nullable()
        .optional(),
});

export const unbanAccountSchema = z.object({ userId: z.string().min(1) });

export type BanAccountInput = z.infer<typeof banAccountSchema>;
export type UnbanAccountInput = z.infer<typeof unbanAccountSchema>;
export type AccountActionData = { userId: string };
