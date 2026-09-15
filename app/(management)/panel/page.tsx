import { requireOrganizerOrAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function PanelPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management access"
            title="Management panel"
            description="Event management, registrations, announcements, and organizer tools will live here in a future phase."
        />
    );
}
