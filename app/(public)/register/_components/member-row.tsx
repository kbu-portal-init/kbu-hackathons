"use client";

import { type Control, Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMessages } from "@/lib/i18n/messages";
import { roleOptions } from "./constants";
import type { FormValues, Locale, SubmittedFormValues } from "./types";

export function MemberRow({
    index,
    control,
    locale,
}: {
    index: number;
    control: Control<FormValues, unknown, SubmittedFormValues>;
    locale: Locale;
}) {
    const t = getMessages(locale).register;
    const th = locale === "th";
    return (
        <div className="flex gap-4 rounded-xl border border-border/60 bg-background p-4">
            <span className="mt-7 hidden size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-primary/50 text-xs font-bold text-brand-muted-foreground sm:flex">
                {index + 1}
            </span>
            <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1.4fr]">
                <Controller
                    name={`members.${index}.name`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>{th ? "ชื่อ" : "Name"}</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder={t.memberPlaceholder}
                                />
                            </InputGroup>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name={`members.${index}.role`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>{th ? "บทบาท" : "Role"}</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="w-full">
                                    <SelectValue>
                                        {t.roles[field.value as keyof typeof t.roles] ??
                                            roleOptions.find((option) => option.value === field.value)?.label}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                    {roleOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {t.roles[opt.value as keyof typeof t.roles] ?? opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name={`members.${index}.email`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="sm:col-span-2 xl:col-span-1">
                            <FieldLabel htmlFor={field.name}>{t.email}</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    {...field}
                                    id={field.name}
                                    type="email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="u...@ms.kbu.ac.th"
                                />
                            </InputGroup>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </div>
        </div>
    );
}
