"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertEventSettings } from "@/actions/management/event-settings";
import {
    type EventSettingsDTO,
    type UpsertEventSettingsInput,
    upsertEventSettingsSchema,
} from "@/lib/contracts/event-settings";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";
import { EventImagesSection } from "./event-images-section";
import { EventScheduleSection } from "./event-schedule-section";
import { FormSubmitButton } from "./form-submit-button";
import { GeneralInfoSection } from "./general-info-section";
import { RegistrationPeriodSection } from "./registration-period-section";
import { SubmissionPeriodSection } from "./submission-period-section";
import { TeamConfigurationSection } from "./team-configuration-section";

type Props = {
    settings: EventSettingsDTO | null;
};

function toDateTime(iso: string) {
    const d = new Date(iso);
    return {
        date: d,
        time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    };
}

function combineDateTime(date: Date, time: string): Date {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
}

export function EventSettingsForm({ settings }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [imageUrls, setImageUrls] = useState<string[]>(settings?.imageUrls ?? []);

    const regOpen = settings ? toDateTime(settings.registrationOpensAt) : { date: new Date(), time: "09:00" };
    const regClose = settings ? toDateTime(settings.registrationClosesAt) : { date: new Date(), time: "17:00" };
    const evtStart = settings ? toDateTime(settings.startsAt) : { date: new Date(), time: "09:00" };
    const evtEnd = settings ? toDateTime(settings.endsAt) : { date: new Date(), time: "17:00" };
    const subOpen = settings ? toDateTime(settings.submissionOpensAt) : { date: new Date(), time: "09:00" };
    const subDeadline = settings ? toDateTime(settings.submissionDeadline) : { date: new Date(), time: "17:00" };

    const form = useForm<UpsertEventSettingsInput>({
        // biome-ignore lint/suspicious/noExplicitAny: zodResolver preprocess causes input/output type mismatch
        resolver: zodResolver(upsertEventSettingsSchema) as any,
        defaultValues: {
            title: settings?.title ?? "",
            description: settings?.description ?? "",
            venue: settings?.venue ?? "",
            imageUrls: settings?.imageUrls ?? [],
            promoUrl: settings?.promoUrl ?? "",
            registrationOpensAt: combineDateTime(regOpen.date, regOpen.time),
            registrationClosesAt: combineDateTime(regClose.date, regClose.time),
            startsAt: combineDateTime(evtStart.date, evtStart.time),
            endsAt: combineDateTime(evtEnd.date, evtEnd.time),
            submissionOpensAt: combineDateTime(subOpen.date, subOpen.time),
            submissionDeadline: combineDateTime(subDeadline.date, subDeadline.time),
            maxTeams: settings?.maxTeams ?? 50,
            minTeamSize: settings?.minTeamSize ?? 2,
            maxTeamSize: settings?.maxTeamSize ?? 5,
        },
    });

    const onSubmit = (values: UpsertEventSettingsInput) => {
        startTransition(async () => {
            const result = await upsertEventSettings({ ...values, imageUrls });
            if (!result.ok) {
                applyActionFieldErrors(result.error.fieldErrors, form.setError);
                toast.error(result.error.message);
                return;
            }
            toast.success(settings ? "Event settings updated" : "Event settings created");
            router.refresh();
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <GeneralInfoSection control={form.control} />

            <EventImagesSection
                imageUrls={imageUrls}
                onAdd={(url) => setImageUrls((prev) => [...prev, url])}
                onRemove={(index) => setImageUrls((prev) => prev.filter((_, i) => i !== index))}
            />

            <div className="grid gap-8 lg:grid-cols-2">
                <RegistrationPeriodSection control={form.control} regOpen={regOpen} regClose={regClose} />
                <EventScheduleSection control={form.control} evtStart={evtStart} evtEnd={evtEnd} />
                <SubmissionPeriodSection control={form.control} subOpen={subOpen} subDeadline={subDeadline} />
                <TeamConfigurationSection control={form.control} />
            </div>

            <FormSubmitButton isPending={isPending} isDirty={form.formState.isDirty} isEditing={!!settings} />
        </form>
    );
}
