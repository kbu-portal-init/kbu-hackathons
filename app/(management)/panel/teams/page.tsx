import { RoutePlaceholder } from "@/components/route-placeholder";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";

export default async function PanelTeamsPage() {
    await requireOrganizerOrAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Management workspace"
            title="All teams"
            description="Browse approved teams, review team details, and monitor participation from this workspace."
        />
    );
}
