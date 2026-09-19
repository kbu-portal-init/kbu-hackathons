import { z } from "zod";
import type { AnnouncementStatus as PrismaAnnouncementStatus } from "@/generated/prisma/enums";
import type { PageInput } from "@/lib/contracts/common";

export type AnnouncementStatus = PrismaAnnouncementStatus;

export type AnnouncementListItem = {
    id: string;
    title: string;
    body: string;
    status: AnnouncementStatus;
    pinned: boolean;
    authorName: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AnnouncementSummary = {
    id: string;
    title: string;
    excerpt: string;
    pinned: boolean;
    publishedAt: string;
};

export const announcementStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const announcementBodySchema = z.string().trim().min(1, "Body is required").max(5000);

export const createAnnouncementSchema = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
    body: announcementBodySchema,
    status: announcementStatusSchema.default("DRAFT"),
    pinned: z.boolean().default(false),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type CreateAnnouncementFormInput = z.input<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = z.object({
    id: z.string().min(1),
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120).optional(),
    body: announcementBodySchema.optional(),
    status: announcementStatusSchema.optional(),
    pinned: z.boolean().optional(),
});
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

export const announcementIdSchema = z.object({ id: z.string().min(1) });
export type AnnouncementIdInput = z.infer<typeof announcementIdSchema>;

export const listAnnouncementsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: announcementStatusSchema.optional(),
});
export type ListAnnouncementsInput = z.infer<typeof listAnnouncementsSchema> & PageInput;
