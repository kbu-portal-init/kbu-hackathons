import type { EventSettingsDTO } from "@/lib/contracts/event-settings";

export type EventSettingsRecord = {
    id: number;
    title: string;
    description: string | null;
    venue: string | null;
    imageUrls: string[];
    promoUrl: string | null;
    registrationOpensAt: Date;
    registrationClosesAt: Date;
    startsAt: Date;
    endsAt: Date;
    submissionOpensAt: Date;
    submissionDeadline: Date;
    maxTeams: number;
    minTeamSize: number;
    maxTeamSize: number;
    createdAt: Date;
    updatedAt: Date;
};

export function toEventSettingsDTO(record: EventSettingsRecord): EventSettingsDTO {
    return {
        id: record.id as 1,
        title: record.title,
        description: record.description,
        venue: record.venue,
        imageUrls: record.imageUrls,
        promoUrl: record.promoUrl,
        registrationOpensAt: record.registrationOpensAt.toISOString(),
        registrationClosesAt: record.registrationClosesAt.toISOString(),
        startsAt: record.startsAt.toISOString(),
        endsAt: record.endsAt.toISOString(),
        submissionOpensAt: record.submissionOpensAt.toISOString(),
        submissionDeadline: record.submissionDeadline.toISOString(),
        maxTeams: record.maxTeams,
        minTeamSize: record.minTeamSize,
        maxTeamSize: record.maxTeamSize,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
    };
}
