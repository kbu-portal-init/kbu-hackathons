import { requireAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function AdminOrganizersPage() {
    await requireAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Administrator workspace"
            title="Organizers"
            description="Organizer roles, contact details, and elevated access management will appear here."
        />
    );
}
