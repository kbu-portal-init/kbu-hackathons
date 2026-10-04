import { Suspense } from "react";
import { listAnnouncements } from "@/actions/management/announcements";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import { AnnouncementManagement } from "./_components/announcement-management";

type searchParams = {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
};

export default function PanelAnnouncementsPage({ searchParams }: { searchParams: Promise<searchParams> }) {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="Announcements"
                description="Create, publish, and manage platform announcements."
            />
            <Suspense fallback={<DashboardListSkeleton />}>
                <AnnouncementContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function AnnouncementContent({ searchParams }: { searchParams: Promise<searchParams> }) {
    const params = await searchParams;

    const result = await listAnnouncements({
        page: params.page ?? "1",
        pageSize: params.pageSize ?? "10",
        search: params.search,
        status: params.status,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    return <AnnouncementManagement items={result.data.items} meta={result.data.meta} />;
}
