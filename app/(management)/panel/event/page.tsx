import { Suspense } from "react";
import { getEventSettings } from "@/actions/management/event-settings";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { EventSettingsForm } from "./_components/event-settings-form";

export default function PanelEventPage() {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="Event settings"
                description="Configure event details, dates, team limits, and public images."
            />
            <Suspense fallback={<DashboardFormSkeleton />}>
                <EventSettingsContent />
            </Suspense>
        </main>
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
