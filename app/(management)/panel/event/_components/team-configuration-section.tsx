"use client";

import { Users } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { PosterPanel } from "@/components/poster-panel";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";

type Props = {
    control: Control<UpsertEventSettingsInput>;
};

export function TeamConfigurationSection({ control }: Props) {
    const [thaiTeams, internationalTeams] = useWatch({
        control,
        name: ["maxThaiTeams", "maxInternationalTeams"],
    });
    const totalTeams = Number(thaiTeams ?? 0) + Number(internationalTeams ?? 0);

    return (
        <PosterPanel className="p-6">
            <div className="flex items-center gap-2">
                <Users className="size-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Team configuration</h2>
            </div>
            <FieldGroup className="mt-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        name="maxThaiTeams"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Max Thai program teams</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={0}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldDescription>Set to 0 to close the Thai program track.</FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="maxInternationalTeams"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Max International program teams</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={0}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldDescription>Set to 0 to close the International program track.</FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <Field>
                    <FieldLabel>Max teams (total)</FieldLabel>
                    <div className="flex h-9 items-center border-2 border-border/15 bg-background px-3 text-sm text-muted-foreground">
                        {totalTeams}
                    </div>
                    <FieldDescription>Sum of the two program limits above.</FieldDescription>
                </Field>
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
        </PosterPanel>
    );
}
