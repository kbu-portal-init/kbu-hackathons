import { Suspense } from "react";
import { listAnnouncements } from "@/actions/management/announcements";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { AnnouncementManagement } from "./_components/announcement-management";

type AnnouncementsQuery = {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
};

export default function PanelAnnouncementsPage({ searchParams }: { searchParams: Promise<AnnouncementsQuery> }) {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="Announcements"
                description="Create, publish, and manage platform announcements."
            />
            <Suspense fallback={<DashboardListSkeleton />}>
                {searchParams.then(({ page, pageSize, search, status }) => (
                    <AnnouncementContent page={page} pageSize={pageSize} search={search} status={status} />
                ))}
            </Suspense>
        </main>
    );
}

async function AnnouncementContent({
    page,
    pageSize,
    search,
    status,
}: {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
}) {
    const result = await listAnnouncements({
        page: page ?? "1",
        pageSize: pageSize ?? "10",
        search,
        status,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    return <AnnouncementManagement items={result.data.items} meta={result.data.meta} />;
}
