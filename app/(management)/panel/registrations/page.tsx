import { Suspense } from "react";
import { listRegistrationRequests } from "@/actions/management/registrations";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { RegistrationManagement } from "./_components/registration-management";

export default function PanelRegistrationsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="Registrations"
                description="Review team applications and manage approval decisions."
            />
            <Suspense fallback={<DashboardListSkeleton />}>
                {searchParams.then(({ status, page }) => (
                    <RegistrationListContent status={status} page={page} />
                ))}
            </Suspense>
        </main>
    );
}

async function RegistrationListContent({ status, page }: { status?: string; page?: string }) {
    const typedStatus = status as "PENDING" | "APPROVED" | "REJECTED" | undefined;

    const result = await listRegistrationRequests({
        status: typedStatus,
        page: page ? Number(page) : 1,
        pageSize: 20,
    });

    if (!result.ok) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-brand-muted-foreground">
                Failed to load registrations.
            </div>
        );
    }

    return <RegistrationManagement items={result.data.items} meta={result.data.meta} status={typedStatus} />;
}
