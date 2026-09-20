import { z } from "zod";

export const updateMemberImageSchema = z.object({
    memberId: z.string().min(1),
    imageUrl: z.url("Invalid URL").nullable(),
});

export type UpdateMemberImageInput = z.infer<typeof updateMemberImageSchema>;

export type UpdateMemberImageData = { imageUrl: string | null };
