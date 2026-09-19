"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertEventSettings } from "@/actions/management/event-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    type EventSettingsDTO,
    type UpsertEventSettingsFormInput,
    type UpsertEventSettingsInput,
    upsertEventSettingsSchema,
} from "@/lib/contracts/event-settings";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Props = {
    settings: EventSettingsDTO | null;
};

export function EventSettingsForm({ settings }: Props) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<UpsertEventSettingsFormInput, unknown, UpsertEventSettingsInput>({
        resolver: zodResolver(upsertEventSettingsSchema),
        defaultValues: settingsToFormValues(settings),
    });

    const onSubmit = async (values: UpsertEventSettingsInput) => {
        setServerError(null);
        const result = await upsertEventSettings(values);
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, form.setError);
            if (result.error.message) toast.error(result.error.message);
            return;
        }
        toast.success(settings ? "Event settings updated" : "Event settings created");
        router.refresh();
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
            <Fieldset title="Basics">
                <FormField label="Title" error={form.formState.errors.title?.message} required>
                    <Input
                        aria-invalid={!!form.formState.errors.title}
                        {...form.register("title")}
                        placeholder="KBU Innovation Sprint 2026"
                    />
                </FormField>
                <FormField label="Description" error={form.formState.errors.description?.message}>
                    <Textarea {...form.register("description")} placeholder="What is this hackathon about?" />
                </FormField>
                <FormField label="Venue" error={form.formState.errors.venue?.message}>
                    <Input {...form.register("venue")} placeholder="KBU Innovation Lab" />
                </FormField>
                <FormField label="Promo URL" error={form.formState.errors.promoUrl?.message}>
                    <Input type="url" {...form.register("promoUrl")} placeholder="https://example.com/promo" />
                </FormField>
            </Fieldset>

            <Fieldset title="Dates">
                <FormField
                    label="Registration opens"
                    error={form.formState.errors.registrationOpensAt?.message}
                    required
                >
                    <Input type="datetime-local" {...form.register("registrationOpensAt")} />
                </FormField>
                <FormField
                    label="Registration closes"
                    error={form.formState.errors.registrationClosesAt?.message}
                    required
                >
                    <Input type="datetime-local" {...form.register("registrationClosesAt")} />
                </FormField>
                <FormField label="Event starts" error={form.formState.errors.startsAt?.message} required>
                    <Input type="datetime-local" {...form.register("startsAt")} />
                </FormField>
                <FormField label="Event ends" error={form.formState.errors.endsAt?.message} required>
                    <Input type="datetime-local" {...form.register("endsAt")} />
                </FormField>
                <FormField label="Submissions open" error={form.formState.errors.submissionOpensAt?.message} required>
                    <Input type="datetime-local" {...form.register("submissionOpensAt")} />
                </FormField>
                <FormField
                    label="Submission deadline"
                    error={form.formState.errors.submissionDeadline?.message}
                    required
                >
                    <Input type="datetime-local" {...form.register("submissionDeadline")} />
                </FormField>
            </Fieldset>

            <Fieldset title="Team size">
                <FormField label="Max teams" error={form.formState.errors.maxTeams?.message} required>
                    <Input type="number" min={1} {...form.register("maxTeams")} />
                </FormField>
                <FormField label="Min team size" error={form.formState.errors.minTeamSize?.message} required>
                    <Input type="number" min={1} {...form.register("minTeamSize")} />
                </FormField>
                <FormField label="Max team size" error={form.formState.errors.maxTeamSize?.message} required>
                    <Input type="number" min={1} {...form.register("maxTeamSize")} />
                </FormField>
            </Fieldset>

            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : settings ? "Save changes" : "Create event"}
                </Button>
            </div>
        </form>
    );
}

function settingsToFormValues(settings: EventSettingsDTO | null): UpsertEventSettingsFormInput {
    if (!settings) {
        return {
            title: "",
            description: undefined,
            venue: undefined,
            promoUrl: undefined,
            registrationOpensAt: "",
            registrationClosesAt: "",
            startsAt: "",
            endsAt: "",
            submissionOpensAt: "",
            submissionDeadline: "",
            maxTeams: 50,
            minTeamSize: 2,
            maxTeamSize: 5,
        };
    }
    return {
        title: settings.title,
        description: settings.description ?? undefined,
        venue: settings.venue ?? undefined,
        promoUrl: settings.promoUrl ?? undefined,
        registrationOpensAt: toLocalInput(settings.registrationOpensAt),
        registrationClosesAt: toLocalInput(settings.registrationClosesAt),
        startsAt: toLocalInput(settings.startsAt),
        endsAt: toLocalInput(settings.endsAt),
        submissionOpensAt: toLocalInput(settings.submissionOpensAt),
        submissionDeadline: toLocalInput(settings.submissionDeadline),
        maxTeams: settings.maxTeams,
        minTeamSize: settings.minTeamSize,
        maxTeamSize: settings.maxTeamSize,
    };
}

function toLocalInput(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
        date.getMinutes(),
    )}`;
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        </section>
    );
}

function FormField({
    label,
    error,
    required,
    children,
}: {
    label: React.ReactNode;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>
                {label}
                {required ? <span className="text-red-600"> *</span> : null}
            </Label>
            {children}
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
    );
}
