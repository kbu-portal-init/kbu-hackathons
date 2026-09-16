import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import type {
    EventSettingsDTO,
    UpsertEventSettingsData,
    UpsertEventSettingsInput,
} from "@/lib/contracts/event-settings";
import { getEventSettings } from "@/lib/data/event-settings";
import prisma from "@/lib/prisma";

export async function fetchEventSettings(): Promise<EventSettingsDTO | null> {
    return getEventSettings();
}

export async function upsertEventSettings(
    input: UpsertEventSettingsInput,
    actorId: string,
): Promise<ActionResult<UpsertEventSettingsData>> {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.eventSettings.upsert({
                where: { id: 1 },
                update: {
                    title: input.title,
                    description: input.description ?? null,
                    venue: input.venue ?? null,
                    imageUrls: input.imageUrls ?? [],
                    promoUrl: input.promoUrl ?? null,
                    registrationOpensAt: input.registrationOpensAt,
                    registrationClosesAt: input.registrationClosesAt,
                    startsAt: input.startsAt,
                    endsAt: input.endsAt,
                    submissionOpensAt: input.submissionOpensAt,
                    submissionDeadline: input.submissionDeadline,
                    maxTeams: input.maxTeams,
                    minTeamSize: input.minTeamSize,
                    maxTeamSize: input.maxTeamSize,
                },
                create: {
                    id: 1,
                    title: input.title,
                    description: input.description ?? null,
                    venue: input.venue ?? null,
                    imageUrls: input.imageUrls ?? [],
                    promoUrl: input.promoUrl ?? null,
                    registrationOpensAt: input.registrationOpensAt,
                    registrationClosesAt: input.registrationClosesAt,
                    startsAt: input.startsAt,
                    endsAt: input.endsAt,
                    submissionOpensAt: input.submissionOpensAt,
                    submissionDeadline: input.submissionDeadline,
                    maxTeams: input.maxTeams,
                    minTeamSize: input.minTeamSize,
                    maxTeamSize: input.maxTeamSize,
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: "EVENT_SETTINGS_UPSERTED",
                    targetType: "EventSettings",
                    targetId: "1",
                    details: {
                        title: input.title,
                        maxTeams: input.maxTeams,
                        minTeamSize: input.minTeamSize,
                        maxTeamSize: input.maxTeamSize,
                    },
                },
            });
        });
    } catch {
        return {
            ok: false,
            error: { code: "UPSERT_FAILED", message: "Failed to save event settings" },
        };
    }

    return { ok: true, data: { id: 1 } };
}
