import { Suspense } from "react";
import { listRegistrationRequests } from "@/actions/management/registrations";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { getEventSettings } from "@/lib/data/event-settings";
import { countApprovedTeams } from "@/lib/data/registrations";
import { RegistrationManagement } from "./_components/registration-management";

export default function PanelRegistrationsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
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
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"] as const;
    const typedStatus = validStatuses.find((value) => value === status);

    const [result, settings] = await Promise.all([
        listRegistrationRequests({
            status: typedStatus,
            page: page ? Number(page) : 1,
            pageSize: 20,
        }),
        getEventSettings(),
    ]);

    if (!result.ok) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Failed to load registrations.
            </div>
        );
    }

    let creationConfig = null;

    if (settings) {
        const [thaiApproved, internationalApproved] = await Promise.all([
            countApprovedTeams("THAI_PROGRAM"),
            countApprovedTeams("INTERNATIONAL_PROGRAM"),
        ]);

        creationConfig = {
            minTeamSize: settings.minTeamSize,
            maxTeamSize: settings.maxTeamSize,
            programSlots: [
                {
                    program: "THAI_PROGRAM" as const,
                    remaining: Math.max(0, settings.maxThaiTeams - thaiApproved),
                    limit: settings.maxThaiTeams,
                },
                {
                    program: "INTERNATIONAL_PROGRAM" as const,
                    remaining: Math.max(0, settings.maxInternationalTeams - internationalApproved),
                    limit: settings.maxInternationalTeams,
                },
            ],
        };
    }

    return (
        <RegistrationManagement
            items={result.data.items}
            meta={result.data.meta}
            status={typedStatus}
            creationConfig={creationConfig}
        />
    );
}
