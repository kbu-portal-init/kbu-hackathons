"use client";

import type { Control } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";
import { DateTimeField } from "./date-time-field";

type Props = {
    control: Control<UpsertEventSettingsInput>;
    evtStart: { date: Date; time: string };
    evtEnd: { date: Date; time: string };
};

export function EventScheduleSection({ control, evtStart, evtEnd }: Props) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Event schedule</h2>
            <FieldGroup className="mt-5">
                <DateTimeField
                    name="startsAt"
                    label="Starts at"
                    control={control}
                    defaultDate={evtStart.date}
                    defaultTime={evtStart.time}
                />
                <DateTimeField
                    name="endsAt"
                    label="Ends at"
                    control={control}
                    defaultDate={evtEnd.date}
                    defaultTime={evtEnd.time}
                />
            </FieldGroup>
        </section>
    );
}
