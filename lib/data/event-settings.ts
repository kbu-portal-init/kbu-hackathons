import "server-only";

import { unstable_cache } from "next/cache";
import type { EventSettingsDTO } from "@/lib/contracts/event-settings";
import { toEventSettingsDTO } from "@/lib/mappers/event-settings";
import prisma from "@/lib/prisma";

const getCachedEventSettings = unstable_cache(
    async (): Promise<EventSettingsDTO | null> => {
        const record = await prisma.eventSettings.findUnique({ where: { id: 1 } });
        return record ? toEventSettingsDTO(record) : null;
    },
    ["event-settings"],
    { revalidate: 30, tags: ["event-settings"] },
);

export async function getEventSettings(): Promise<EventSettingsDTO | null> {
    return getCachedEventSettings();
}

export async function existsEventSettings(): Promise<boolean> {
    const count = await prisma.eventSettings.count({ where: { id: 1 } });
    return count > 0;
}
