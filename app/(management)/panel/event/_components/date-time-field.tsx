"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";

type Props = {
    name:
        | "registrationOpensAt"
        | "registrationClosesAt"
        | "startsAt"
        | "endsAt"
        | "submissionOpensAt"
        | "submissionDeadline";
    label: string;
    control: Control<UpsertEventSettingsInput>;
    defaultDate: Date;
    defaultTime: string;
};

export function combineDateTime(date: Date, time: string): Date {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
}

function formatTime12(time: string): string {
    const [h, m] = time.split(":").map(Number);
    return new Date(0, 0, 0, h, m).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function DateTimeField({ name, label, control, defaultDate, defaultTime }: Props) {
    const [date, setDate] = useState<Date>(defaultDate);
    const [time, setTime] = useState(defaultTime);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{label}</FieldLabel>
                    <Popover>
                        <PopoverTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-left font-normal"
                                />
                            }
                        >
                            <CalendarIcon data-icon="inline-start" className="shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">
                                {date ? format(date, "MMM d, yyyy") : "Pick a date"}
                            </span>
                            <span className="shrink-0 text-muted-foreground">{formatTime12(time)}</span>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <div className="sm:flex">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(selected) => {
                                        if (selected) {
                                            setDate(selected);
                                            field.onChange(combineDateTime(selected, time));
                                        }
                                    }}
                                />
                                <div className="flex w-48 flex-col border-l border-border p-3">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Clock className="size-3" />
                                        Time
                                    </div>
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => {
                                            const t = e.target.value;
                                            setTime(t);
                                            field.onChange(combineDateTime(date, t));
                                        }}
                                        className="mt-2 h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
