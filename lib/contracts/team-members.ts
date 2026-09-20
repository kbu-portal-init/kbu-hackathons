import { z } from "zod";

export const updateMemberImageSchema = z.object({
    memberId: z.string().min(1),
    imageUrl: z.url("Invalid URL").nullable(),
});

export type UpdateMemberImageInput = z.infer<typeof updateMemberImageSchema>;

export type UpdateMemberImageData = { imageUrl: string | null };

export const generateMemberCardSchema = z.object({
    memberId: z.string().min(1),
});

export type GenerateMemberCardInput = z.infer<typeof generateMemberCardSchema>;

export type TeamMemberCard = {
    id: string;
    name: string;
    role: string;
    studentEmail: string;
    imageUrl: string | null;
    cardUrl: string | null;
    cardShareToken: string | null;
};

export type GenerateMemberCardData = Pick<TeamMemberCard, "id" | "cardUrl">;
