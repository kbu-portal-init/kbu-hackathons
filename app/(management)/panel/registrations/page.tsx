import { listRegistrationRequests } from "@/actions/management/registrations";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { RegistrationManagement } from "./_components/registration-management";

export default async function PanelRegistrationsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    await requireOrganizerOrAdmin();
    const params = await searchParams;

    const result = await listRegistrationRequests({
        status: params.status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
        page: params.page ? Number(params.page) : 1,
        pageSize: 20,
    });

    if (!result.ok) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                Failed to load registrations.
            </div>
        );
    }

    return (
        <RegistrationManagement
            items={result.data.items}
            meta={result.data.meta}
            status={params.status as "PENDING" | "APPROVED" | "REJECTED" | undefined}
        />
    );
}
