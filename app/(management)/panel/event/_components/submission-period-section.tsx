"use client";

import type { Control } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";
import { DateTimeField } from "./date-time-field";

type Props = {
    control: Control<UpsertEventSettingsInput>;
    subOpen: { date: Date; time: string };
    subDeadline: { date: Date; time: string };
};

export function SubmissionPeriodSection({ control, subOpen, subDeadline }: Props) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Submission period</h2>
            <FieldGroup className="mt-5">
                <DateTimeField
                    name="submissionOpensAt"
                    label="Opens at"
                    control={control}
                    defaultDate={subOpen.date}
                    defaultTime={subOpen.time}
                />
                <DateTimeField
                    name="submissionDeadline"
                    label="Deadline"
                    control={control}
                    defaultDate={subDeadline.date}
                    defaultTime={subDeadline.time}
                />
            </FieldGroup>
        </section>
    );
}
