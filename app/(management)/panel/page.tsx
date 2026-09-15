import { requireOrganizerOrAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function PanelPage() {
    requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management access"
            title="Management panel"
            description="Event management, registrations, announcements, and organizer tools will live here in a future phase."
        />
    );
}
