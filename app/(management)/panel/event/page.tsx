import { Suspense } from "react";
import { getEventSettings } from "@/actions/management/event-settings";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { EventSettingsForm } from "./_components/event-settings-form";

export default function PanelEventPage() {
    return (
        <Suspense fallback={<DashboardFormSkeleton />}>
            <EventSettingsContent />
        </Suspense>
    );
}

async function EventSettingsContent() {
    const result = await getEventSettings();

    if (!result.ok) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Failed to load event settings.
            </div>
        );
    }

    return <EventSettingsForm key={result.data?.updatedAt} settings={result.data} />;
}
