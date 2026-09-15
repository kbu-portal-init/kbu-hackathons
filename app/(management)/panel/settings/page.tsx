import { RoutePlaceholder } from "@/components/route-placeholder";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";

export default async function PanelSettingsPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management workspace"
            title="Settings"
            description="Management workspace preferences and platform settings will appear here."
        />
    );
}
