import { getEventSchedule } from "@/actions/management/event-schedule";
import { EventScheduleSection } from "./event-schedule-section";

export async function EventScheduleLoader() {
    const result = await getEventSchedule();
    if (!result.ok) {
        return <div className="text-sm text-muted-foreground">Failed to load schedule.</div>;
    }
    return <EventScheduleSection schedule={result.data} />;
}
