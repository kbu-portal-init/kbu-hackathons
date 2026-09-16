import "server-only";

import type { EventSettingsDTO } from "@/lib/contracts/event-settings";
import { toEventSettingsDTO } from "@/lib/mappers/event-settings";
import prisma from "@/lib/prisma";

export async function getEventSettings(): Promise<EventSettingsDTO | null> {
    const record = await prisma.eventSettings.findUnique({ where: { id: 1 } });
    return record ? toEventSettingsDTO(record) : null;
}

export async function existsEventSettings(): Promise<boolean> {
    const count = await prisma.eventSettings.count({ where: { id: 1 } });
    return count > 0;
}
