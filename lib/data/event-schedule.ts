import "server-only";

import { unstable_cache } from "next/cache";
import type { EventScheduleDTO } from "@/lib/contracts/event-schedule";
import { toEventScheduleDTO } from "@/lib/mappers/event-schedule";
import prisma from "@/lib/prisma";

const getCachedEventSchedule = unstable_cache(
    async (): Promise<EventScheduleDTO> => {
        const records = await prisma.eventScheduleItem.findMany({
            orderBy: [{ day: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        });
        return toEventScheduleDTO(records);
    },
    ["event-schedule"],
    { revalidate: 30, tags: ["event-schedule"] },
);

export async function getEventSchedule(): Promise<EventScheduleDTO> {
    return getCachedEventSchedule();
}
