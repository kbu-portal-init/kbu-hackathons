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
                <RegistrationListContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function RegistrationListContent({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    const params = await searchParams;

    const result = await listRegistrationRequests({
        status: params.status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
        page: params.page ? Number(params.page) : 1,
        pageSize: 20,
    });

    if (!result.ok) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
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
