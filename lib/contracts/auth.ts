import { z } from "zod";
import type { ActionResult } from "./common";

const kbuEmail = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .refine((e) => e.endsWith("@ms.kbu.ac.th"), "Email must use the @ms.kbu.ac.th domain");

export const teamMagicLinkSchema = z.object({
    email: kbuEmail,
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

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export type LoginData = {
    authenticated: true;
};

export type LoginResult = ActionResult<LoginData>;
