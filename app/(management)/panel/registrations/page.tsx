import { requireOrganizerOrAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function PanelRegistrationsPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management workspace"
            title="Registrations"
            description="Review team registrations and manage approval decisions from this workspace."
        />
    );
}
