import { RoutePlaceholder } from "@/components/route-placeholder";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminPage() {
    await requireAdmin();

    return (
        <RoutePlaceholder
            eyebrow="Administrator access"
            title="Administrator workspace"
            description="Platform oversight, audit records, organizer management, and administrative settings will live here in a future phase."
        />
    );
}
