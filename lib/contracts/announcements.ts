import { z } from "zod";
import type { ActionResult, ListActionResult, PageInput } from "@/lib/contracts/common";

export const MAX_ANNOUNCEMENT_TITLE_LENGTH = 200;
export const MAX_ANNOUNCEMENT_CONTENT_LENGTH = 10_000;

export const AnnouncementStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export type AnnouncementStatus = z.infer<typeof AnnouncementStatusSchema>;

const AnnouncementTitleSchema = z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(
        MAX_ANNOUNCEMENT_TITLE_LENGTH,
        `The announcement title must be at most ${MAX_ANNOUNCEMENT_TITLE_LENGTH} characters long`,
    );

const AnnouncementContentSchema = z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(
        MAX_ANNOUNCEMENT_CONTENT_LENGTH,
        `The announcement content must be at most ${MAX_ANNOUNCEMENT_CONTENT_LENGTH} characters long`,
    );

const AnnouncementImageURLSchema = z.url("Invalid image URL").optional().or(z.literal(""));

export const CreateAnnouncementInputSchema = z.object({
    title: AnnouncementTitleSchema,
    content: AnnouncementContentSchema,
    imageUrl: AnnouncementImageURLSchema,
});

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;

export const announcementIdSchema = z.object({
    announcementId: z.string().min(1, "Announcement ID is required"),
});

export type AnnouncementIdInput = z.infer<typeof announcementIdSchema>;

export const updateAnnouncementSchema = announcementIdSchema.extend({
    title: AnnouncementTitleSchema.optional(),
    content: AnnouncementContentSchema.optional(),
    imageUrl: AnnouncementImageURLSchema,
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

export const ListAnnouncementSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    status: AnnouncementStatusSchema.optional(),
});

export type ListAnnouncementInput = z.infer<typeof ListAnnouncementSchema> & PageInput;

export type AnnouncementDTO = {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    status: AnnouncementStatus;
    publishedAt: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
};

export type AnnouncementActionResult = ActionResult<AnnouncementDTO>;

export type AnnouncementListActionResult = ListActionResult<AnnouncementDTO>;
