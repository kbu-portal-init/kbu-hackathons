import { RoutePlaceholder } from "@/components/route-placeholder";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminOrganizersPage() {
    await requireAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Administrator"
            title="Organizers"
            description="Manage organizer accounts and elevated access."
        />
    );
}
