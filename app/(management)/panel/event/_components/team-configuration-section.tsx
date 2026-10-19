"use client";

import { Users } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
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
        <section className="rounded-none border-2 border-brand-ink bg-card p-6">
            <div className="flex items-center gap-2">
                <Users className="size-5 text-brand-muted-foreground" />
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-brand-ink">Team configuration</h2>
            </div>
            <FieldGroup className="mt-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        name="maxThaiTeams"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="font-display text-sm font-semibold text-brand-ink"
                                >
                                    Max Thai program teams
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={0}
                                    aria-invalid={fieldState.invalid}
                                    className="rounded-none border-2 border-brand-ink/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="font-display text-sm font-semibold text-brand-ink"
                                >
                                    Max International program teams
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={0}
                                    aria-invalid={fieldState.invalid}
                                    className="rounded-none border-2 border-brand-ink/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                                <FieldDescription>Set to 0 to close the International program track.</FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <Field>
                    <FieldLabel className="font-display text-sm font-semibold text-brand-ink">
                        Max teams (total)
                    </FieldLabel>
                    <div className="flex h-9 items-center rounded-none border-2 border-brand-ink/15 bg-brand-paper px-3 text-sm text-brand-muted-foreground">
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
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="font-display text-sm font-semibold text-brand-ink"
                                >
                                    Min team size
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={1}
                                    aria-invalid={fieldState.invalid}
                                    className="rounded-none border-2 border-brand-ink/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="font-display text-sm font-semibold text-brand-ink"
                                >
                                    Max team size
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    min={1}
                                    aria-invalid={fieldState.invalid}
                                    className="rounded-none border-2 border-brand-ink/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
