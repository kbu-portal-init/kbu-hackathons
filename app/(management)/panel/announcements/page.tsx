import { requireOrganizerOrAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function PanelAnnouncementsPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management workspace"
            title="Announcements"
            description="Create, publish, and manage platform announcements from this workspace."
        />
    );
}
