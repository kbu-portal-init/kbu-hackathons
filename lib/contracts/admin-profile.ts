import { z } from "zod";

export type AdminProfileDTO = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    emailVerified: boolean;
};

export const updateAdminProfileSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email(),
    image: z.string().url().nullable().optional(),
});
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;

export const changeAdminPasswordSchema = z
    .object({ currentPassword: z.string().min(1), newPassword: z.string().min(8), confirmPassword: z.string().min(8) })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });
export type ChangeAdminPasswordInput = z.infer<typeof changeAdminPasswordSchema>;

export type AdminProfileActionData = { profile: AdminProfileDTO };
