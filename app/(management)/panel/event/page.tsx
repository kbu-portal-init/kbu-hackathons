import { getEventSettings } from "@/actions/management/event-settings";
import { EventSettingsForm } from "./_components/event-settings-form";

export default async function PanelEventPage() {
    const result = await getEventSettings();

    if (!result.ok) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                Failed to load event settings.
            </div>
        );
    }

    return <EventSettingsForm key={result.data?.updatedAt} settings={result.data} />;
}
