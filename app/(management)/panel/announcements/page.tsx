import { Suspense } from "react";
import { listAnnouncements } from "@/actions/management/announcements";
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
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-muted-foreground">Management workspace</p>
                <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create, publish, and manage platform announcements.
                </p>
            </div>
            <Suspense fallback={<DashboardListSkeleton />}>
                <AnnouncementContent searchParams={searchParams} />
            </Suspense>
        </div>
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
