import { RoutePlaceholder } from "@/components/route-placeholder";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";

export default async function PanelOrganizersPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management workspace"
            title="Organizers"
            description="Organizer roles, contact details, and access management will appear here."
        />
    );
}
