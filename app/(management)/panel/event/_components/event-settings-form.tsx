"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertEventSettings } from "@/actions/management/event-settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    type EventSettingsDTO,
    type UpsertEventSettingsInput,
    upsertEventSettingsSchema,
} from "@/lib/contracts/event-settings";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";
import { DateSection } from "./date-section";
import { combineDateTime } from "./date-time-field";
import { EventImagesSection } from "./event-images-section";
import { GeneralInfoSection } from "./general-info-section";
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
                <DateSection
                    title="Registration period"
                    control={form.control}
                    fields={[
                        { name: "registrationOpensAt", label: "Opens at", date: regOpen.date, time: regOpen.time },
                        { name: "registrationClosesAt", label: "Closes at", date: regClose.date, time: regClose.time },
                    ]}
                />
                <DateSection
                    title="Event schedule"
                    control={form.control}
                    fields={[
                        { name: "startsAt", label: "Starts at", date: evtStart.date, time: evtStart.time },
                        { name: "endsAt", label: "Ends at", date: evtEnd.date, time: evtEnd.time },
                    ]}
                />
                <DateSection
                    title="Submission period"
                    control={form.control}
                    fields={[
                        { name: "submissionOpensAt", label: "Opens at", date: subOpen.date, time: subOpen.time },
                        {
                            name: "submissionDeadline",
                            label: "Deadline",
                            date: subDeadline.date,
                            time: subDeadline.time,
                        },
                    ]}
                />
                <TeamConfigurationSection control={form.control} />
            </div>

            <Separator />
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 data-icon="inline-start" className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save data-icon="inline-start" />
                            {settings ? "Save changes" : "Create event settings"}
                        </>
                    )}
                </Button>
                {form.formState.isDirty && <p className="text-sm text-zinc-500">You have unsaved changes.</p>}
            </div>
        </form>
    );
}
