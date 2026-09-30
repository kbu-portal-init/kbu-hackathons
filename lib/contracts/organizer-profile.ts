import { z } from "zod";

export type OrganizerProfileDTO = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    emailVerified: boolean;
};

export const updateOrganizerProfileSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email(),
    image: z.string().url().nullable().optional(),
});

export const changeOrganizerPasswordSchema = z
    .object({ currentPassword: z.string().min(1), newPassword: z.string().min(8), confirmPassword: z.string().min(8) })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export type UpdateOrganizerProfileInput = z.infer<typeof updateOrganizerProfileSchema>;
export type ChangeOrganizerPasswordInput = z.infer<typeof changeOrganizerPasswordSchema>;
export type OrganizerProfileActionData = { profile: OrganizerProfileDTO };
