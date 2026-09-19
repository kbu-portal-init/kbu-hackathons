import { z } from "zod";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const ALLOWED_SUBMISSION_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain",
] as const;

export const deleteObjectSchema = z.object({
    key: z.string().trim().min(1, "Object key is required"),
});

export type DeleteObjectInput = z.infer<typeof deleteObjectSchema>;
