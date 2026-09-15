import { RoutePlaceholder } from "@/components/route-placeholder";
import { requireAdmin } from "@/lib/auth/guards";

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
