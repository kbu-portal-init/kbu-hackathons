"use client";

import type { Control } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";
import { DateTimeField } from "./date-time-field";

type DateField = {
    name:
        | "registrationOpensAt"
        | "registrationClosesAt"
        | "startsAt"
        | "endsAt"
        | "submissionOpensAt"
        | "submissionDeadline";
    label: string;
    date: Date;
    time: string;
};

type Props = {
    title: string;
    control: Control<UpsertEventSettingsInput>;
    fields: [DateField, DateField];
};

export function DateSection({ title, control, fields }: Props) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">{title}</h2>
            <FieldGroup className="mt-5">
                {fields.map((f) => (
                    <DateTimeField
                        key={f.name}
                        name={f.name}
                        label={f.label}
                        control={control}
                        defaultDate={f.date}
                        defaultTime={f.time}
                    />
                ))}
            </FieldGroup>
        </section>
    );
}
