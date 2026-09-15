import { requireAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function AdminSettingsPage() {
    await requireAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Administrator workspace"
            title="Platform settings"
            description="Global platform preferences and administrative controls will appear here in a future phase."
        />
    );
}
