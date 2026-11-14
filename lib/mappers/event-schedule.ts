import type { EventScheduleDTO, EventScheduleItemDTO } from "@/lib/contracts/event-schedule";

export type EventScheduleRecord = {
    id: string;
    day: number;
    time: string;
    activity: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

export function toEventScheduleDTO(records: EventScheduleRecord[]): EventScheduleDTO {
    const items: EventScheduleItemDTO[] = records.map((r) => ({
        id: r.id,
        day: r.day,
        time: r.time,
        activity: r.activity,
    }));
    return { items };
}
