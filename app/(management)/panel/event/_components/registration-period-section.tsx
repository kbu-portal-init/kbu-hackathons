"use client";

import type { Control } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import type { UpsertEventSettingsInput } from "@/lib/contracts/event-settings";
import { DateTimeField } from "./date-time-field";

type Props = {
    control: Control<UpsertEventSettingsInput>;
    regOpen: { date: Date; time: string };
    regClose: { date: Date; time: string };
};

export function RegistrationPeriodSection({ control, regOpen, regClose }: Props) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Registration period</h2>
            <FieldGroup className="mt-5">
                <DateTimeField
                    name="registrationOpensAt"
                    label="Opens at"
                    control={control}
                    defaultDate={regOpen.date}
                    defaultTime={regOpen.time}
                />
                <DateTimeField
                    name="registrationClosesAt"
                    label="Closes at"
                    control={control}
                    defaultDate={regClose.date}
                    defaultTime={regClose.time}
                />
            </FieldGroup>
        </section>
    );
}
