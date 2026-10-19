"use client";

import { CalendarDays } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { PosterFieldLabel, PosterInput, PosterPanel, PosterTextarea } from "@/components/poster";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";

type Props = {
    control: Control<UpsertEventSettingsInput>;
};

export function GeneralInfoSection({ control }: Props) {
    return (
        <PosterPanel className="p-6">
            <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">General information</h2>
            </div>
            <FieldGroup className="mt-5">
                <Controller
                    name="title"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <PosterFieldLabel
                                htmlFor={field.name}
                                className="font-display text-sm font-semibold text-foreground"
                            >
                                Title
                            </PosterFieldLabel>
                            <PosterInput
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="e.g. KBU Hackathon 2026"
                                className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <PosterFieldLabel
                                htmlFor={field.name}
                                className="font-display text-sm font-semibold text-foreground"
                            >
                                Description
                            </PosterFieldLabel>
                            <PosterTextarea
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="Describe the hackathon..."
                                rows={4}
                                className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        name="venue"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <PosterFieldLabel
                                    htmlFor={field.name}
                                    className="font-display text-sm font-semibold text-foreground"
                                >
                                    Venue
                                </PosterFieldLabel>
                                <PosterInput
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="e.g. KBU Main Campus"
                                    className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="promoUrl"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <PosterFieldLabel
                                    htmlFor={field.name}
                                    className="font-display text-sm font-semibold text-foreground"
                                >
                                    Promo URL <span className="font-normal text-muted-foreground">(optional)</span>
                                </PosterFieldLabel>
                                <PosterInput
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="https://..."
                                    className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
