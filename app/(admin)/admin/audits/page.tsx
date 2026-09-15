import { requireAdmin } from "@/actions/auth";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function AdminAuditsPage() {
    await requireAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Administrator workspace"
            title="Audit logs"
            description="Administrative activity, access changes, and event history will appear here when audit records are available."
        />
    );
}
