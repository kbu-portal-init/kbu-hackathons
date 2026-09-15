import { requireOrganizerOrAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function PanelEventPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management workspace"
            title="Event"
            description="Create, configure, and manage hackathon event details from this workspace."
        />
    );
}
