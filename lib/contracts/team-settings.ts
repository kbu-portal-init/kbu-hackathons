import { z } from "zod";

export const updateTeamLogoSchema = z.object({
    imageUrl: z.url("Invalid URL").nullable(),
});

export type UpdateTeamLogoInput = z.infer<typeof updateTeamLogoSchema>;

export type UpdateTeamLogoData = { imageUrl: string | null };
