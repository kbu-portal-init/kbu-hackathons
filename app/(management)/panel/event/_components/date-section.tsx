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
        <section className="border-2 border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h2>
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
