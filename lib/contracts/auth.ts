import { z } from "zod";
import type { ActionResult } from "./common";

export const teamLoginSchema = z.object({
    username: z.string().trim().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const staffLoginSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const passwordResetSchema = z
    .object({
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type TeamLoginInput = z.infer<typeof teamLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export type LoginData = {
    authenticated: true;
};

export type LoginResult = ActionResult<LoginData>;
