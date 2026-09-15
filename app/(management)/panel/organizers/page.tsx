import { requireOrganizerOrAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

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
