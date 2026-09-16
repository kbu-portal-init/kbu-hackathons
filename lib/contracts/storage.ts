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

export const presignedUrlSchema = z
    .object({
        fileName: z.string().trim().min(1, "File name is required").max(255),
        fileType: z.string().min(1, "File type is required"),
        fileSize: z.number().int().positive("File size must be positive"),
        category: z.enum(["image", "submission"]),
    })
    .refine(
        (data) => {
            if (data.category === "image") {
                return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(data.fileType);
            }
            return (ALLOWED_SUBMISSION_TYPES as readonly string[]).includes(data.fileType);
        },
        { message: "File type not allowed", path: ["fileType"] },
    )
    .refine(
        (data) => {
            const maxSize = data.category === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
            return data.fileSize <= maxSize;
        },
        { message: "File too large", path: ["fileSize"] },
    );

export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;

export type PresignedUrlResult = {
    presignedUrl: string;
    key: string;
    publicUrl: string;
};

export const deleteObjectSchema = z.object({
    key: z.string().trim().min(1, "Object key is required"),
});

export type DeleteObjectInput = z.infer<typeof deleteObjectSchema>;

export const finalizeSchema = z.object({
    key: z.string().trim().min(1, "Object key is required"),
});

export type FinalizeInput = z.infer<typeof finalizeSchema>;
