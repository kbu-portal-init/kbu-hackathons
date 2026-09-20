"use client";

import { Users } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";

type Props = {
    control: Control<UpsertEventSettingsInput>;
};

export function TeamConfigurationSection({ control }: Props) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
                <Users className="size-5 text-orange-500" />
                <h2 className="text-lg font-semibold">Team configuration</h2>
            </div>
            <FieldGroup className="mt-5">
                <Controller
                    name="maxTeams"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Max teams</FieldLabel>
                            <Input {...field} id={field.name} type="number" min={1} aria-invalid={fieldState.invalid} />
                            <FieldDescription>Maximum number of teams allowed to register.</FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        name="minTeamSize"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Min team size</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={1}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="maxTeamSize"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Max team size</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={1}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
            </FieldGroup>
        </section>
    );
}
