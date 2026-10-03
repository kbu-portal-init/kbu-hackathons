import { Suspense } from "react";
import { listRegistrationRequests } from "@/actions/management/registrations";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { RegistrationManagement } from "./_components/registration-management";

export default function PanelRegistrationsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    return (
        <Suspense fallback={<DashboardListSkeleton />}>
            <RegistrationListContent searchParams={searchParams} />
        </Suspense>
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
