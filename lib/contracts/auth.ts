import { z } from "zod";

export const teamLoginSchema = z.object({
    username: z.string().trim().min(1, "Team name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const staffLoginSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type TeamLoginInput = z.infer<typeof teamLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
