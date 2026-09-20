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

type DateTimeFieldName =
    | "registrationOpensAt"
    | "registrationClosesAt"
    | "startsAt"
    | "endsAt"
    | "submissionOpensAt"
    | "submissionDeadline";

type Props = {
    name: DateTimeFieldName;
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

const timePresets = [
    { label: "9:00 AM", value: "09:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "5:00 PM", value: "17:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "9:00 PM", value: "21:00" },
];

function formatDisplayTime(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
                            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">
                                {date ? format(date, "MMM d, yyyy") : "Pick a date"}
                            </span>
                            <span className="shrink-0 text-muted-foreground">{formatDisplayTime(time)}</span>
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
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {timePresets.map((preset) => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                className={`rounded-md px-2 py-1 text-xs transition-colors ${
                                                    time === preset.value
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                }`}
                                                onClick={() => {
                                                    setTime(preset.value);
                                                    field.onChange(combineDateTime(date, preset.value));
                                                }}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
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
