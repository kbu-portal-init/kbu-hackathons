import { z } from "zod";
import type { PageInput } from "@/lib/contracts/common";

const organizerNameSchema = z.string().trim().min(1, "Name is required");
const organizerEmailSchema = z.email("Invalid email address");
const organizerPasswordSchema = z.string().min(8, "Password must be at least 8 characters");

export const createOrganizerSchema = z.object({
    name: organizerNameSchema,
    email: organizerEmailSchema,
    password: organizerPasswordSchema,
});
export type CreateOrganizerInput = z.infer<typeof createOrganizerSchema>;

export type OrganizerListItem = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    banned: boolean;
    banReason: string | null;
    banExpires: string | null;
};
export type CreateOrganizerData = { id: string };

export const organizerIdSchema = z.object({ userId: z.string().min(1) });
export type OrganizerIdInput = z.infer<typeof organizerIdSchema>;

export const listOrganizersSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListOrganizersInput = z.infer<typeof listOrganizersSchema> & PageInput;

export const updateOrganizerSchema = organizerIdSchema.extend({
    name: organizerNameSchema.optional(),
    email: organizerEmailSchema.optional(),
    password: organizerPasswordSchema.optional(),
});
export type UpdateOrganizerInput = z.infer<typeof updateOrganizerSchema>;
