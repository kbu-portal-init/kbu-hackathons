import "server-only";

import { revalidateTag } from "next/cache";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type {
    EventScheduleDTO,
    UpsertEventScheduleData,
    UpsertEventScheduleInput,
} from "@/lib/contracts/event-schedule";
import { getEventSchedule } from "@/lib/data/event-schedule";
import prisma from "@/lib/prisma";

export async function fetchEventSchedule(): Promise<EventScheduleDTO> {
    return getEventSchedule();
}

export async function upsertEventSchedule(
    input: UpsertEventScheduleInput,
    actorId: string,
): Promise<ActionResult<UpsertEventScheduleData>> {
    try {
        await prisma.$transaction(
            async (tx) => {
                await tx.eventScheduleItem.deleteMany({});
                if (input.items.length > 0) {
                    await tx.eventScheduleItem.createMany({
                        data: input.items.map((item, index) => ({
                            day: item.day,
                            time: item.time,
                            activity: item.activity,
                            sortOrder: index,
                        })),
                    });
                }
                await tx.auditLog.create({
                    data: {
                        actorId,
                        action: "EVENT_SCHEDULE_UPSERTED",
                        targetType: "EventSchedule",
                        targetId: "schedule",
                        details: { count: input.items.length },
                    },
                });
            },
            { isolationLevel: "Serializable" },
        );
        revalidateTag("event-schedule", "max");
    } catch {
        return { ok: false, error: { code: ErrorCodes.UPSERT_FAILED, message: "Failed to save schedule." } };
    }
    return { ok: true, data: { count: input.items.length } };
}
