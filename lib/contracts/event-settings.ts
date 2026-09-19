import { z } from "zod";

const eventDateSchema = z.preprocess(
    (value) => (typeof value === "string" || value instanceof Date ? value : undefined),
    z.coerce.date(),
);

export const eventSettingsIdSchema = z.object({ id: z.literal(1) });

export const upsertEventSettingsSchema = z
    .object({
        title: z.string().trim().min(1, "Title is required"),
        description: z.string().trim().optional(),
        venue: z.string().trim().optional(),
        imageUrls: z.array(z.string().url()).optional(),
        promoUrl: z.string().url("Invalid URL").optional(),
        registrationOpensAt: eventDateSchema,
        registrationClosesAt: eventDateSchema,
        startsAt: eventDateSchema,
        endsAt: eventDateSchema,
        submissionOpensAt: eventDateSchema,
        submissionDeadline: eventDateSchema,
        maxTeams: z.coerce.number().int().min(1, "Max teams must be at least 1"),
        minTeamSize: z.coerce.number().int().min(1, "Min team size must be at least 1"),
        maxTeamSize: z.coerce.number().int().min(1, "Max team size must be at least 1"),
    })
    .refine((data) => data.registrationOpensAt < data.registrationClosesAt, {
        message: "Registration must open before it closes",
        path: ["registrationClosesAt"],
    })
    .refine((data) => data.startsAt < data.endsAt, {
        message: "Event must start before it ends",
        path: ["endsAt"],
    })
    .refine((data) => data.submissionOpensAt < data.submissionDeadline, {
        message: "Submission must open before the deadline",
        path: ["submissionDeadline"],
    })
    .refine((data) => data.minTeamSize <= data.maxTeamSize, {
        message: "Min team size must be less than or equal to max team size",
        path: ["maxTeamSize"],
    });

export type UpsertEventSettingsInput = z.infer<typeof upsertEventSettingsSchema>;
export type UpsertEventSettingsFormInput = z.input<typeof upsertEventSettingsSchema>;
export type UpsertEventSettingsData = { id: 1 };

export type EventSettingsDTO = {
    id: 1;
    title: string;
    description: string | null;
    venue: string | null;
    imageUrls: string[];
    promoUrl: string | null;
    registrationOpensAt: string;
    registrationClosesAt: string;
    startsAt: string;
    endsAt: string;
    submissionOpensAt: string;
    submissionDeadline: string;
    maxTeams: number;
    minTeamSize: number;
    maxTeamSize: number;
    createdAt: string;
    updatedAt: string;
};
