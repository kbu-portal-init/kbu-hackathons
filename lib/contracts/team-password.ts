import { z } from "zod";

export const changeTeamPasswordSchema = z
    .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export type ChangeTeamPasswordInput = z.infer<typeof changeTeamPasswordSchema>;
